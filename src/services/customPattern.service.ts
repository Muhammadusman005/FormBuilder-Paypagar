/**
 * customPattern.service.ts
 *
 * Manages user-saved custom regex patterns in localStorage.
 * Custom patterns appear alongside built-in REGEX_PATTERNS in the
 * Quick Patterns dropdown of the Validation section.
 */

import type { RegexPattern } from '../constants';

const STORAGE_KEY = 'form_builder_custom_patterns';

export const customPatternService = {
  /** Load all saved custom patterns */
  getAll(): RegexPattern[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Save a new custom pattern. Returns the saved pattern with generated id. */
  save(pattern: Omit<RegexPattern, 'id'>): RegexPattern {
    const saved: RegexPattern = {
      ...pattern,
      id: `custom_${Date.now()}`,
    };
    const all = customPatternService.getAll();
    all.push(saved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return saved;
  },

  /** Delete a custom pattern by id */
  delete(id: string): void {
    const filtered = customPatternService.getAll().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  /** Check if an id belongs to a custom pattern */
  isCustom(id: string): boolean {
    return id.startsWith('custom_');
  },
};
