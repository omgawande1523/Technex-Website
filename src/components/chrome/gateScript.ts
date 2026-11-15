/** sessionStorage key set once the visitor passes the Enter gate. */
export const GATE_SESSION_KEY = "tnx-entered";

/**
 * Inline <head> script: marks returning visitors (and deep links) before first
 * paint so the Enter gate never flashes for them.
 */
export const gateScript = `try{if(sessionStorage.getItem("${GATE_SESSION_KEY}")==="1"||location.pathname!=="/")document.documentElement.dataset.entered="1"}catch(e){document.documentElement.dataset.entered="1"}`;
