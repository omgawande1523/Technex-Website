import { notFound } from "next/navigation";

/**
 * Developer-only API playground. It calls admin endpoints directly and
 * contains a hardcoded workshop id, so it must never ship to production.
 */
export default function TestApiLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }
  return children;
}
