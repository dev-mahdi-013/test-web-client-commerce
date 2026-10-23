const STORAGE_KEY = "hodhod.backend";

export type BackendSnapshot = {
  at: string;
  status: number;
  data: unknown;
};

export type BackendSnapshots = Record<string, BackendSnapshot>;

function readAll(): BackendSnapshots {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as BackendSnapshots) : {};
  } catch {
    return {};
  }
}

export function recordBackendResponse(path: string, status: number, data: unknown) {
  if (!import.meta.env.DEV) return;
  try {
    const snapshots = readAll();
    snapshots[path] = { at: new Date().toISOString(), status, data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  } catch {
    return;
  }
}

export function backendSnapshots(): BackendSnapshots {
  return readAll();
}
