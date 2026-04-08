'use client';

/**
 * MatchesContext
 *
 * Tracks which matches have "graduated" from the timer-avatar row ("Your Matches")
 * into the permanent "Chats" list. Graduation happens when a reply is received
 * after the user's first ice-breaker message.
 *
 * State is persisted in localStorage so it survives navigation between pages.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const STORAGE_KEY = 'mitimaiti_graduated_matches';

interface MatchesContextValue {
  /** Set of match IDs that have graduated to permanent chats */
  graduatedMatchIds: Set<string>;
  /** Call this when a reply arrives after the first ice-breaker */
  graduateMatch: (matchId: string) => void;
}

const MatchesContext = createContext<MatchesContextValue>({
  graduatedMatchIds: new Set(),
  graduateMatch: () => {},
});

export function MatchesProvider({ children }: { children: ReactNode }) {
  const [graduatedMatchIds, setGraduatedMatchIds] = useState<Set<string>>(() => {
    // Initialise from localStorage on first render (client only)
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return new Set<string>(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
    return new Set<string>();
  });

  // Persist to localStorage whenever the set changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(graduatedMatchIds)));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [graduatedMatchIds]);

  const graduateMatch = useCallback((matchId: string) => {
    setGraduatedMatchIds((prev) => {
      if (prev.has(matchId)) return prev; // already graduated — no re-render
      const next = new Set(prev);
      next.add(matchId);
      return next;
    });
  }, []);

  return (
    <MatchesContext.Provider value={{ graduatedMatchIds, graduateMatch }}>
      {children}
    </MatchesContext.Provider>
  );
}

export function useMatches() {
  return useContext(MatchesContext);
}
