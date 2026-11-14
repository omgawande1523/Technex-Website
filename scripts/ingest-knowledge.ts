import { buildKnowledgeIndex } from "../src/lib/knowledge";

async function main() {
  try {
    const result = await buildKnowledgeIndex(true);
    console.log(`TECHNEX RAG index created: ${result.files} document(s), ${result.chunks} text chunk(s).`);
    if (result.chunks === 0) {
      console.warn("No text was indexed. Add PDF or DOCX files to ./knowledge-docs. Scanned/image-only PDFs require OCR before they can be used.");
    }
    if (result.skipped.length) {
      console.warn("Skipped documents:");
      for (const item of result.skipped) console.warn(`- ${item}`);
    }
  } catch (error) {
    console.error("Could not build the TECHNEX RAG index:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();
