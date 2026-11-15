"use client";

/**
 * Shared UI state for the chrome: whether the Enter gate is open and which
 * home scene is in view. Plain module store + useSyncExternalStore.
 */
import { useSyncExternalStore } from "react";

type State = { gateOpen: boolean; scene: string | null };
let state: State = { gateOpen: false, scene: null };
const listeners = new Set<() => void>();

export function setHud(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const SERVER_STATE: State = { gateOpen: false, scene: null };

export function useHud() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}
