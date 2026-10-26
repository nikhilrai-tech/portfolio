"use client";

// Keeps the browser's install prompt (Chromium only) so the command menu can offer it later.
type InstallEvent = Event & { prompt: () => Promise<void> };
let deferred: InstallEvent | null = null;

export function listenForInstall() {
  const onPrompt = (e: Event) => {
    e.preventDefault();
    deferred = e as InstallEvent;
  };
  const onInstalled = () => (deferred = null);
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}

export const canInstall = () => deferred !== null;

export async function promptInstall() {
  if (!deferred) return;
  await deferred.prompt();
  deferred = null;
}
