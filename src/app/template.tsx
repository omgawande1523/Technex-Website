import { ViewTransition } from "react";

/**
 * Templates remount on every navigation, so enter/exit fire here.
 * Only navigations tagged with the "ink" transition type animate
 * (see components/chrome/InkTransition.tsx); everything else swaps instantly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ ink: "ink-in", default: "none" }}
      exit={{ ink: "ink-out", default: "none" }}
      default="none"
    >
      <div className="route-root">{children}</div>
    </ViewTransition>
  );
}
