import type { Gem } from "./types";

const STORAGE_KEY = "ai-voice-chat-gems";

export function getGems(): Gem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Gem[]) : [];
  } catch {
    return [];
  }
}

export function getGemById(id: string): Gem | undefined {
  return getGems().find((g) => g.id === id);
}

export function saveGem(gem: Omit<Gem, "id" | "createdAt">): Gem {
  const gems = getGems();
  const newGem: Gem = {
    ...gem,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  gems.unshift(newGem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gems));
  return newGem;
}

export function updateGem(id: string, updates: Partial<Omit<Gem, "id" | "createdAt">>): Gem | null {
  const gems = getGems();
  const idx = gems.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  gems[idx] = { ...gems[idx], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gems));
  return gems[idx];
}

export function deleteGem(id: string): boolean {
  const gems = getGems();
  const filtered = gems.filter((g) => g.id !== id);
  if (filtered.length === gems.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
