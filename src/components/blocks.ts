/**
 * Page-block model + parser — pure, server/client agnostic.
 * Kept out of PageRenderer.tsx so server components can parse content
 * without crossing the 'use client' boundary.
 */
export interface Block {
  id: string;
  type: string;
  /**
   * Arbitrary JSON authored in the builder. Deliberately dynamic: keys vary
   * per block type and the renderer defends against unknown keys/types
   * (unknown block types render nothing rather than crashing).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

export function parseBlocks(content: string): Block[] {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed?.blocks) ? parsed.blocks : [];
  } catch {
    return [];
  }
}
