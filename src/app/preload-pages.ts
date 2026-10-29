import { create } from "zustand";
import { useSessionStore } from "@/features/auth/stores/session.store";
import type { AuthSession } from "@/features/auth/types";
import { appRoleOf, resolveActiveRoleId, type AppRole } from "@/features/profile/roles";
import { pages } from "./pages";

type PageKey = keyof typeof pages;

const chamberPages: PageKey[] = [
  "HrPage",
  "MembersPage",
  "AssociationsPage",
  "ChamberAssembliesPage",
  "ChamberAssemblyDetailPage",
];

const associationPages: PageKey[] = [
  "AssociationInfoPage",
  "AssociationAssembliesPage",
  "AssociationAssemblyDetailPage",
];

/** The pages each role can reach from its menu; keep in sync with nav-items.ts. */
const pagesByRole: Record<AppRole, PageKey[]> = {
  "chamber-president": chamberPages,
  other: chamberPages,
  organizations: [
    "MembersPage",
    "AssociationsPage",
    "OrganizationsAssembliesPage",
    "OrganizationsAssemblyDetailPage",
  ],
  "association-head": ["AssociationSecretariesPage", ...associationPages],
  "association-info": ["AssociationSecretariesPage", ...associationPages],
  "association-secretary": associationPages,
  "card-issuance": ["UnionMembersPage"],
  user: ["UserAssembliesPage", "UserAssemblyDetailPage"],
};

/**
 * Pages whose download has finished, successfully or not. A failed one counts as settled too, so a flaky
 * network can never trap the user behind the loading screen; the router simply retries it on navigation.
 */
const settled = new Set<PageKey>();

/** Bumped whenever the readiness of the pages may have changed, so components that read it re-render. */
const usePreloadStore = create<{ version: number }>(() => ({ version: 0 }));

function notifyChange() {
  usePreloadStore.setState((state) => ({ version: state.version + 1 }));
}

/**
 * Notifies once `remaining()` reaches zero. A timer can fire a hair before performance.now() / Date.now() agree that
 * the time is up, and a notification that arrives "too early" is lost for good, so it re-checks and waits again.
 */
function notifyWhenElapsed(remaining: () => number) {
  const wait = remaining();
  if (wait <= 0) {
    notifyChange();
    return;
  }
  window.setTimeout(() => notifyWhenElapsed(remaining), wait + 5);
}


function pageKeysFor(session: AuthSession, activeRoleId: string | null): PageKey[] {
  const roles = session.user.roles;
  const activeRole = roles.find((role) => role.id === resolveActiveRoleId(roles, activeRoleId));
  return ["ProfilePage", ...pagesByRole[appRoleOf(activeRole)]];
}

/**
 * Remembers (in localStorage, so it survives a refresh) which "token + role" combinations already had all their
 * pages downloaded. After a refresh those pages are served by the browser cache whenever the router needs them,
 * so there is no reason to download them all again; the preload only runs after a login or a role switch.
 */
const PRELOADED_KEY = "hodhod.preloaded";

function preloadSignature(session: AuthSession, activeRoleId: string | null) {
  return `${session.tokenId}:${resolveActiveRoleId(session.user.roles, activeRoleId)}`;
}

function readPreloaded(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PRELOADED_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writePreloaded(signatures: string[]) {
  try {
    if (signatures.length === 0) localStorage.removeItem(PRELOADED_KEY);
    else localStorage.setItem(PRELOADED_KEY, JSON.stringify(signatures));
  } catch {
    // Storage may be unavailable (private mode); the only cost is preloading again after a refresh.
  }
}

/** Resolves to true when every page was downloaded without an error. */
async function download(keys: PageKey[]): Promise<boolean> {
  const results = await Promise.all(
    keys.map(async (key) => {
      if (settled.has(key)) return true;
      let ok = true;
      // import() caches the module, so a page that is already downloaded costs nothing here.
      await pages[key]().catch(() => {
        ok = false;
      });
      settled.add(key);
      notifyChange();
      return ok;
    }),
  );
  return results.every(Boolean);
}

function preloadForCurrentSession() {
  const { session, activeRoleId } = useSessionStore.getState();

  if (!session) {
    // Signed out: forget what was preloaded, so the next login downloads the pages again.
    writePreloaded([]);
    void download(["LoginPage"]);
    return;
  }

  const keys = pageKeysFor(session, activeRoleId);
  const signature = preloadSignature(session, activeRoleId);
  const done = readPreloaded();

  if (done.includes(signature)) {
    // Already downloaded at login (this is a refresh): don't fetch everything again.
    for (const key of keys) settled.add(key);
    notifyChange();
    return;
  }

  void download(keys).then((ok) => {
    if (!ok) return; // Leave it unmarked so that the next start tries again.
    // Only the current token's entries are kept, so the list can't grow across logins.
    const sameToken = readPreloaded().filter((item) => item.startsWith(`${session.tokenId}:`));
    writePreloaded([...new Set([...sameToken, signature])]);
  });
}

/** The boot loading screen stays at least this long after the page was opened, so it is always seen. */
const MIN_BOOT_LOADER_MS = 600;
/** Never wait longer than this for the fonts; a slow font must not hold the app back. */
const MAX_FONT_WAIT_MS = 3000;
const BOOT_FONTS = ["300 1em Peyda", "400 1em Peyda", "500 1em Peyda", "700 1em Peyda"];

let fontsSettled = false;
let bootDone = false;

function waitForFonts() {
  const finish = () => {
    if (fontsSettled) return;
    fontsSettled = true;
    notifyChange();
  };
  window.setTimeout(finish, MAX_FONT_WAIT_MS);
  if (!document.fonts) return finish();
  Promise.all(BOOT_FONTS.map((font) => document.fonts.load(font, "فارسی")))
    .catch(() => {})
    .finally(finish);
}

let started = false;

/**
 * Downloads the active role's page chunks once: silently right after login and on role switch. On a refresh they are
 * not downloaded again (see PRELOADED_KEY). Only the first page open shows the loading screen (see useAppBootReady).
 */
function startPagePreloading() {
  if (started) return;
  started = true;
  preloadForCurrentSession();
  waitForFonts();
  // performance.now() counts from the moment the page was opened, so a slow first load adds no extra wait.
  notifyWhenElapsed(() => MIN_BOOT_LOADER_MS - performance.now());
  useSessionStore.subscribe((state, previous) => {
    if (state.session !== previous.session || state.activeRoleId !== previous.activeRoleId) {
      preloadForCurrentSession();
    }
  });
}

/**
 * True once the app is ready to be shown after the page was opened or refreshed: the minimum time has passed, the
 * fonts are in and the first page (the login page, or the active role's pages when signed in) is downloaded.
 * Once true it stays true, so logging out or navigating never brings the boot screen back.
 */
export function useAppBootReady() {
  usePreloadStore((state) => state.version);
  const session = useSessionStore((state) => state.session);
  const activeRoleId = useSessionStore((state) => state.activeRoleId);
  if (bootDone) return true;

  const keys: PageKey[] = session ? pageKeysFor(session, activeRoleId) : ["LoginPage"];
  bootDone =
    performance.now() >= MIN_BOOT_LOADER_MS && fontsSettled && keys.every((key) => settled.has(key));
  return bootDone;
}

// Starts itself on import, so it is wired up whenever this module is loaded (also after a hot reload in dev),
// and always before React renders anything that depends on it.
startPagePreloading();
