import { ViewTransition } from "react";

/**
 * Templates remount on every navigation, so enter/exit fire here.
 * Only navigations tagged with the "page" transition type animate
 * (see components/chrome/PageTransition.tsx); everything else swaps instantly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ page: "page-in", default: "none" }}
      exit={{ page: "page-out", default: "none" }}
      default="none"
    >
      <div className="route-root">{children}</div>
    </ViewTransition>
  );
}
