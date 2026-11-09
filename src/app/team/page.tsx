import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | TECHNEX",
  description: "The TECHNEX team page is coming soon.",
};

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <section className="max-w-2xl">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-300">
          TECHNEX 2026
        </p>
        <h1 className="mb-4 text-4xl font-bold">Our Team</h1>
        <p className="text-lg text-white/70">
          We&apos;re preparing the team page. Meet the people behind TECHNEX
          here soon.
        </p>
      </section>
    </main>
  );
}
