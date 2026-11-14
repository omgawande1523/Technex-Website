import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

type IndexedChunk = {
  id: string;
  source: string;
  chunkNumber: number;
  text: string;
  embedding: number[];
};

type RagIndex = {
  version: 1;
  embeddingModel: string;
  fingerprint: string;
  builtAt: string;
  files: string[];
  chunks: IndexedChunk[];
};

export type KnowledgeResult = {
  text: string;
  found: boolean;
  sources: string[];
};

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge-docs");
const CACHE_DIR = path.join(process.cwd(), ".cache");
const INDEX_PATH = path.join(CACHE_DIR, "technex-rag-index.json");
const CHUNK_SIZE = 1400;
const CHUNK_OVERLAP = 220;
const EMBEDDING_BATCH_SIZE = 32;
const configuredTopK = Number.parseInt(process.env.RAG_TOP_K || "12", 10);
const TOP_K = Number.isFinite(configuredTopK) ? Math.min(Math.max(configuredTopK, 4), 24) : 12;
const configuredContextChars = Number.parseInt(process.env.RAG_CONTEXT_MAX_CHARS || "24000", 10);
const MAX_CONTEXT_CHARS = Number.isFinite(configuredContextChars)
  ? Math.min(Math.max(configuredContextChars, 8000), 40000)
  : 24000;
const configuredSimilarity = Number.parseFloat(process.env.RAG_MIN_SIMILARITY || "0.22");
const MIN_SIMILARITY = Number.isFinite(configuredSimilarity) ? configuredSimilarity : 0.22;

const require = createRequire(path.join(process.cwd(), "package.json"));
let memoryIndex: RagIndex | null = null;
let memoryFingerprint = "";
let lastFingerprintCheck = 0;
let buildPromise: Promise<RagIndex> | null = null;
let lastSkippedDocuments: string[] = [];

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeText(value: string): string {
  return value
    .replace(/\u0000/g, " ")
    .replace(/\u00ad/g, "")
    .replace(/\r/g, "\n")
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/\n[ ]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function listKnowledgeFiles(): Promise<Array<{ name: string; content: Buffer; hash: string }>> {
  await fs.mkdir(KNOWLEDGE_DIR, { recursive: true });
  const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true });
  const files = [] as Array<{ name: string; content: Buffer; hash: string }>;

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (extension !== ".pdf" && extension !== ".docx") continue;
    const fullPath = path.join(KNOWLEDGE_DIR, entry.name);
    const content = await fs.readFile(fullPath);
    files.push({ name: entry.name, content, hash: sha256(content) });
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

async function extractDocumentText(fileName: string, content: Buffer): Promise<string> {
  const extension = path.extname(fileName).toLowerCase();

  if (extension === ".pdf") {
    // pdf-parse v1 is loaded at runtime to keep the PDF parser on the Node.js server only.
    const pdfParse = require("pdf-parse") as (input: Buffer) => Promise<{ text?: string }>;
    const parsed = await pdfParse(content);
    return normalizeText(parsed.text ?? "");
  }

  if (extension === ".docx") {
    const mammoth = require("mammoth") as {
      extractRawText: (options: { buffer: Buffer }) => Promise<{ value?: string }>;
    };
    const parsed = await mammoth.extractRawText({ buffer: content });
    return normalizeText(parsed.value ?? "");
  }

  return "";
}

function splitIntoChunks(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const units: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= CHUNK_SIZE) {
      units.push(paragraph);
      continue;
    }

    let cursor = 0;
    while (cursor < paragraph.length) {
      let end = Math.min(cursor + CHUNK_SIZE, paragraph.length);
      if (end < paragraph.length) {
        const boundary = paragraph.lastIndexOf(" ", end);
        if (boundary > cursor + Math.floor(CHUNK_SIZE * 0.65)) end = boundary;
      }
      units.push(paragraph.slice(cursor, end).trim());
      if (end >= paragraph.length) break;
      cursor = Math.max(end - CHUNK_OVERLAP, cursor + 1);
    }
  }

  // Merge short adjacent paragraphs without losing their original sequence.
  const merged: string[] = [];
  for (const unit of units) {
    const last = merged[merged.length - 1];
    if (last && last.length + unit.length + 2 <= CHUNK_SIZE) merged[merged.length - 1] = `${last}\n\n${unit}`;
    else merged.push(unit);
  }
  return merged.filter((part) => part.length >= 35);
}

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required to create the TECHNEX document embeddings.");
  }

  const model = (process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small").trim();
  const vectors: number[][] = [];

  for (let offset = 0; offset < texts.length; offset += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(offset, offset + EMBEDDING_BATCH_SIZE);
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": process.env.SITE_NAME || "TECHNEX AI"
      },
      body: JSON.stringify({ model, input: batch, encoding_format: "float" }),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store"
    });

    const raw = await response.text();
    if (!response.ok) {
      let detail = raw;
      try {
        const parsed = JSON.parse(raw) as { error?: { message?: string } };
        detail = parsed.error?.message || raw;
      } catch {
        // Keep provider response as-is when it is not JSON.
      }
      throw new Error(`OpenRouter embeddings failed (${response.status}): ${detail.slice(0, 500)}`);
    }

    const payload = JSON.parse(raw) as { data?: Array<{ index: number; embedding: number[] }> };
    const batchVectors = (payload.data ?? []).sort((a, b) => a.index - b.index).map((item) => item.embedding);
    if (batchVectors.length !== batch.length || batchVectors.some((vector) => !Array.isArray(vector) || vector.length === 0)) {
      throw new Error("OpenRouter returned an incomplete embedding batch. Check the configured embedding model.");
    }
    vectors.push(...batchVectors);
  }

  return vectors;
}

async function readCachedIndex(): Promise<RagIndex | null> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw) as RagIndex;
    if (parsed.version !== 1 || !Array.isArray(parsed.chunks)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function currentFingerprint(files: Array<{ name: string; hash: string }>, embeddingModel: string): Promise<string> {
  return sha256(JSON.stringify({ embeddingModel, files: files.map(({ name, hash }) => ({ name, hash })) }));
}

export async function buildKnowledgeIndex(force = false): Promise<{ files: number; chunks: number; skipped: string[] }> {
  if (buildPromise) {
    const existing = await buildPromise;
    return { files: existing.files.length, chunks: existing.chunks.length, skipped: [] };
  }

  buildPromise = (async () => {
    const files = await listKnowledgeFiles();
    const embeddingModel = (process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small").trim();
    const fingerprint = await currentFingerprint(files, embeddingModel);
    const cached = force ? null : await readCachedIndex();
    if (cached?.fingerprint === fingerprint && cached.embeddingModel === embeddingModel) {
      memoryIndex = cached;
      memoryFingerprint = fingerprint;
      lastSkippedDocuments = [];
      return cached;
    }

    const skipped: string[] = [];
    const draftChunks: Omit<IndexedChunk, "embedding">[] = [];

    for (const file of files) {
      try {
        const text = await extractDocumentText(file.name, file.content);
        if (!text || text.length < 35) {
          skipped.push(`${file.name} (no extractable text; scanned PDFs may need OCR)`);
          continue;
        }
        for (const [index, chunk] of splitIntoChunks(text).entries()) {
          draftChunks.push({
            id: `${sha256(file.name).slice(0, 10)}-${index + 1}`,
            source: file.name,
            chunkNumber: index + 1,
            text: chunk
          });
        }
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown parsing error";
        skipped.push(`${file.name} (${reason})`);
      }
    }

    lastSkippedDocuments = skipped;
    if (draftChunks.length === 0) {
      const emptyIndex: RagIndex = {
        version: 1,
        embeddingModel,
        fingerprint,
        builtAt: new Date().toISOString(),
        files: files.map((file) => file.name),
        chunks: []
      };
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(INDEX_PATH, JSON.stringify(emptyIndex), "utf8");
      memoryIndex = emptyIndex;
      memoryFingerprint = fingerprint;
      return emptyIndex;
    }

    const vectors = await createEmbeddings(draftChunks.map((chunk) => chunk.text));
    const index: RagIndex = {
      version: 1,
      embeddingModel,
      fingerprint,
      builtAt: new Date().toISOString(),
      files: files.map((file) => file.name),
      chunks: draftChunks.map((chunk, position) => ({ ...chunk, embedding: vectors[position] }))
    };

    await fs.mkdir(CACHE_DIR, { recursive: true });
    const temporaryPath = `${INDEX_PATH}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(index), "utf8");
    await fs.rename(temporaryPath, INDEX_PATH);
    memoryIndex = index;
    memoryFingerprint = fingerprint;
    if (skipped.length) console.warn("Some TECHNEX knowledge documents were skipped:", skipped);
    return index;
  })();

  try {
    const index = await buildPromise;
    return { files: index.files.length, chunks: index.chunks.length, skipped: lastSkippedDocuments };
  } finally {
    buildPromise = null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function getCurrentIndex(): Promise<RagIndex> {
  const now = Date.now();
  if (memoryIndex && now - lastFingerprintCheck < 20_000) return memoryIndex;
  lastFingerprintCheck = now;

  const files = await listKnowledgeFiles();
  const embeddingModel = (process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small").trim();
  const fingerprint = await currentFingerprint(files, embeddingModel);
  if (memoryIndex && memoryFingerprint === fingerprint) return memoryIndex;

  const cached = await readCachedIndex();
  if (cached?.fingerprint === fingerprint && cached.embeddingModel === embeddingModel) {
    memoryIndex = cached;
    memoryFingerprint = fingerprint;
    return cached;
  }

  await buildKnowledgeIndex();
  if (memoryIndex) return memoryIndex;
  return { version: 1, embeddingModel, fingerprint, builtAt: new Date().toISOString(), files: [], chunks: [] };
}

export async function getRelevantKnowledge(query: string): Promise<KnowledgeResult> {
  const index = await getCurrentIndex();
  if (index.chunks.length === 0) {
    return {
      text: "No text-based PDF or DOCX knowledge documents have been indexed yet. Add official TECHNEX documents to the knowledge-docs folder and run npm run ingest:knowledge.",
      found: false,
      sources: []
    };
  }

  const [queryEmbedding] = await createEmbeddings([query]);
  const ranked = index.chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const bestScore = ranked[0]?.score ?? 0;
  if (bestScore < MIN_SIMILARITY) {
    return { text: "No sufficiently relevant TECHNEX information was found.", found: false, sources: [] };
  }

  // Keep a wider set of relevant matches than the original starter index. For
  // multi-part event descriptions, also include nearby chunks from the same
  // document so a passage is less likely to be cut off at a chunk boundary.
  const coreMatches = ranked
    .slice(0, TOP_K)
    .filter((chunk, position) => chunk.score >= Math.max(MIN_SIMILARITY, bestScore - 0.18) || position === 0);

  const selectedById = new Map<string, { chunk: IndexedChunk; score: number }>();
  for (const match of coreMatches) {
    selectedById.set(match.id, { chunk: match, score: match.score });
  }

  const chunksBySource = new Map<string, IndexedChunk[]>();
  for (const chunk of index.chunks) {
    const list = chunksBySource.get(chunk.source) ?? [];
    list.push(chunk);
    chunksBySource.set(chunk.source, list);
  }

  for (const match of coreMatches.slice(0, 8)) {
    const sameDocument = chunksBySource.get(match.source) ?? [];
    for (const neighbourNumber of [match.chunkNumber - 1, match.chunkNumber + 1]) {
      const neighbour = sameDocument.find((chunk) => chunk.chunkNumber === neighbourNumber);
      if (!neighbour || selectedById.has(neighbour.id)) continue;
      selectedById.set(neighbour.id, { chunk: neighbour, score: Math.max(0, match.score - 0.025) });
    }
  }

  const expanded = [...selectedById.values()].sort((a, b) => b.score - a.score);
  const selected: IndexedChunk[] = [];
  let contextLength = 0;
  for (const item of expanded) {
    const extraLength = item.chunk.text.length + (selected.length ? 8 : 0);
    if (contextLength + extraLength > MAX_CONTEXT_CHARS) continue;
    selected.push(item.chunk);
    contextLength += extraLength;
  }

  const sources = [...new Set(selected.map((chunk) => chunk.source))];
  // Do not expose source filenames or citations to the answer model. They are
  // retained in the local index only for internal retrieval and maintenance.
  const context = selected.map((chunk) => chunk.text).join("\n\n---\n\n");

  return {
    text: context,
    found: true,
    sources
  };
}

export async function getKnowledgeStatus(): Promise<{ filesCount: number; chunksCount: number; files: string[] }> {
  const index = await getCurrentIndex();
  return { filesCount: index.files.length, chunksCount: index.chunks.length, files: index.files };
}
