/**
 * Shared, mutable animation state. It lives in a ref (not React state) so the
 * render loops can read it every frame without triggering re-renders.
 *
 *  cur    – smoothed position along the events, 0 … N-1 (float)
 *  target – raw position taken from the scrollbar
 *  vel    – smoothed speed in "events per second" (drives motion energy)
 *  intro  – 0 → 1 once on load (entrance animation)
 *  time   – seconds, advances every frame
 */
export interface SceneState {
  cur: number;
  target: number;
  vel: number;
  intro: number;
  time: number;
}

export const createSceneState = (): SceneState => ({
  cur: 0,
  target: 0,
  vel: 0,
  intro: 0,
  time: 0,
});
