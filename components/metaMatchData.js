const storageKey = "bellyResetMetaMatchData";

const paramAliases = {
  email: ["email", "em"],
  phone: ["phone", "ph"],
  externalId: ["external_id", "externalId", "externalid", "eid"],
  fbLoginId: ["fb_login_id", "fbLoginId", "fbloginid"]
};

function cleanValue(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function readStoredMatchData() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([key, value]) => [key, cleanValue(value)])
        .filter(([, value]) => value)
    );
  } catch {
    return {};
  }
}

function readUrlMatchData() {
  const params = new URLSearchParams(window.location.search);
  const data = {};

  for (const [key, aliases] of Object.entries(paramAliases)) {
    for (const alias of aliases) {
      const value = cleanValue(params.get(alias));
      if (value) {
        data[key] = value;
        break;
      }
    }
  }

  return data;
}

export function readMetaMatchData() {
  if (typeof window === "undefined") return {};

  const stored = readStoredMatchData();
  const fromUrl = readUrlMatchData();
  const merged = { ...stored, ...fromUrl };

  if (Object.keys(fromUrl).length > 0) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {}
  }

  return merged;
}