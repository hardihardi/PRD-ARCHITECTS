import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface ApiProviderConfig {
  main: string;
  context7: string;
  stitch: string;
}

export type ApiKeysMap = Record<string, ApiProviderConfig>;

export const DEFAULT_PROVIDERS = [
  "Gemini",
  "Claude",
  "Chatgpt",
  "Z.ai",
  "Xiaomi.ai",
];

const STORAGE_PRIMARY = "app_api_keys_detailed";
const STORAGE_BACKUP = "app_api_keys_backup_v1";
const STORAGE_LEGACY = "app_api_keys";

export const createEmptyKeysMap = (): ApiKeysMap => {
  const map: ApiKeysMap = {};
  DEFAULT_PROVIDERS.forEach((prov) => {
    map[prov] = { main: "", context7: "", stitch: "" };
  });
  return map;
};

/**
 * Normalizes any raw object into a complete ApiKeysMap with all standard providers
 */
export function normalizeApiKeysMap(raw: any): ApiKeysMap {
  const result = createEmptyKeysMap();
  if (!raw || typeof raw !== "object") return result;

  let globalContext7 = "";
  let globalStitch = "";

  // Extract global context7 & stitch if available
  Object.keys(raw).forEach((key) => {
    if (raw[key]?.context7 && !globalContext7) globalContext7 = raw[key].context7;
    if (raw[key]?.stitch && !globalStitch) globalStitch = raw[key].stitch;
  });

  // Populate map with raw values or existing
  Object.keys(result).forEach((prov) => {
    const rawProv = raw[prov] || {};
    result[prov] = {
      main: typeof rawProv.main === "string" ? rawProv.main.trim() : typeof rawProv === "string" ? rawProv.trim() : "",
      context7: typeof rawProv.context7 === "string" ? rawProv.context7 : globalContext7,
      stitch: typeof rawProv.stitch === "string" ? rawProv.stitch : globalStitch,
    };
  });

  // Include any extra non-standard custom providers
  Object.keys(raw).forEach((prov) => {
    if (!result[prov] && typeof raw[prov] === "object") {
      result[prov] = {
        main: typeof raw[prov].main === "string" ? raw[prov].main.trim() : "",
        context7: typeof raw[prov].context7 === "string" ? raw[prov].context7 : globalContext7,
        stitch: typeof raw[prov].stitch === "string" ? raw[prov].stitch : globalStitch,
      };
    }
  });

  return result;
}

/**
 * Synchronously retrieves stored API keys from localStorage (Primary + Backup + Legacy)
 */
export function loadStoredApiKeysSync(): ApiKeysMap {
  try {
    // 1. Try Primary Storage
    const primary = localStorage.getItem(STORAGE_PRIMARY);
    if (primary) {
      const parsed = JSON.parse(primary);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        return normalizeApiKeysMap(parsed);
      }
    }

    // 2. Try Backup Storage
    const backup = localStorage.getItem(STORAGE_BACKUP);
    if (backup) {
      const parsed = JSON.parse(backup);
      if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
        const normalized = normalizeApiKeysMap(parsed);
        // Restore to primary
        localStorage.setItem(STORAGE_PRIMARY, JSON.stringify(normalized));
        return normalized;
      }
    }

    // 3. Try Legacy Key
    const legacy = localStorage.getItem(STORAGE_LEGACY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed && typeof parsed === "object") {
        const normalized = normalizeApiKeysMap(parsed);
        localStorage.setItem(STORAGE_PRIMARY, JSON.stringify(normalized));
        localStorage.setItem(STORAGE_BACKUP, JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch (err) {
    console.warn("[ApiKeyStorage] Failed to read from localStorage:", err);
  }

  return createEmptyKeysMap();
}

/**
 * Saves API keys to both localStorage (Primary & Backup) AND Cloud Firestore
 */
export async function saveStoredApiKeys(
  newKeysData: ApiKeysMap,
  globalContext7?: string,
  globalStitch?: string
): Promise<ApiKeysMap> {
  const current = loadStoredApiKeysSync();

  // Merge new keys with current keys so non-empty keys are not lost
  const merged: ApiKeysMap = { ...current };

  Object.keys(newKeysData).forEach((prov) => {
    const existingProv = merged[prov] || { main: "", context7: "", stitch: "" };
    const newProv = newKeysData[prov] || { main: "", context7: "", stitch: "" };

    merged[prov] = {
      main: newProv.main !== undefined ? newProv.main.trim() : existingProv.main,
      context7: globalContext7 !== undefined ? globalContext7 : (newProv.context7 || existingProv.context7 || ""),
      stitch: globalStitch !== undefined ? globalStitch : (newProv.stitch || existingProv.stitch || ""),
    };
  });

  // Ensure global context7 & stitch are applied across all providers if provided
  if (globalContext7 !== undefined || globalStitch !== undefined) {
    Object.keys(merged).forEach((prov) => {
      merged[prov] = {
        ...merged[prov],
        context7: globalContext7 !== undefined ? globalContext7 : merged[prov].context7,
        stitch: globalStitch !== undefined ? globalStitch : merged[prov].stitch,
      };
    });
  }

  // 1. Save to Local Storage (Primary & Backup)
  try {
    const jsonStr = JSON.stringify(merged);
    localStorage.setItem(STORAGE_PRIMARY, jsonStr);
    localStorage.setItem(STORAGE_BACKUP, jsonStr);
  } catch (err) {
    console.error("[ApiKeyStorage] Error writing to localStorage:", err);
  }

  // 2. Save to Firestore Cloud Database
  try {
    const payload = {
      keys: merged,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.email || "anonymous",
    };

    // System-wide app settings doc
    const systemDocRef = doc(db, "app_settings", "api_keys");
    await setDoc(systemDocRef, payload, { merge: true });

    // User specific settings doc if authenticated
    if (auth.currentUser?.uid) {
      const userDocRef = doc(db, "users", auth.currentUser.uid, "settings", "api_keys");
      await setDoc(userDocRef, payload, { merge: true });
    }
  } catch (err) {
    console.warn("[ApiKeyStorage] Failed to sync keys to Firestore:", err);
  }

  return merged;
}

/**
 * Asynchronously fetches stored API keys from Firestore Cloud Database
 * and restores them to localStorage if local keys are empty or incomplete.
 */
export async function syncApiKeysFromCloud(): Promise<{ keys: ApiKeysMap; restoredFromCloud: boolean }> {
  let localKeys = loadStoredApiKeysSync();
  let restoredFromCloud = false;

  try {
    let cloudKeysRaw: any = null;

    // 1. Check User-specific doc first if logged in
    if (auth.currentUser?.uid) {
      const userDocRef = doc(db, "users", auth.currentUser.uid, "settings", "api_keys");
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        cloudKeysRaw = userSnap.data()?.keys;
      }
    }

    // 2. Check System-wide doc if user doc not found or empty
    if (!cloudKeysRaw) {
      const systemDocRef = doc(db, "app_settings", "api_keys");
      const systemSnap = await getDoc(systemDocRef);
      if (systemSnap.exists()) {
        cloudKeysRaw = systemSnap.data()?.keys;
      }
    }

    if (cloudKeysRaw && typeof cloudKeysRaw === "object") {
      const cloudNormalized = normalizeApiKeysMap(cloudKeysRaw);
      
      // Check if cloud has non-empty keys that local is missing
      let hasNewCloudData = false;
      const merged = { ...localKeys };

      Object.keys(cloudNormalized).forEach((prov) => {
        const cloudMain = cloudNormalized[prov]?.main || "";
        const localMain = localKeys[prov]?.main || "";

        if (cloudMain && !localMain) {
          merged[prov] = {
            ...merged[prov],
            main: cloudMain,
            context7: cloudNormalized[prov]?.context7 || merged[prov]?.context7 || "",
            stitch: cloudNormalized[prov]?.stitch || merged[prov]?.stitch || "",
          };
          hasNewCloudData = true;
        }
      });

      if (hasNewCloudData) {
        restoredFromCloud = true;
        localKeys = merged;
        const jsonStr = JSON.stringify(merged);
        localStorage.setItem(STORAGE_PRIMARY, jsonStr);
        localStorage.setItem(STORAGE_BACKUP, jsonStr);
      }
    }
  } catch (err) {
    console.warn("[ApiKeyStorage] Error syncing API keys from cloud:", err);
  }

  return { keys: localKeys, restoredFromCloud };
}
