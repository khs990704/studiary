import { create } from 'zustand';
import type { Session } from '../types/session';

interface SessionState {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updated: Partial<Session>) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({ sessions: [...state.sessions, session] })),

  updateSession: (id, updated) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updated } : s
      ),
    })),

  removeSession: (id) =>
    set((state) => ({
      sessions: state.sessions
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order_num: i + 1 })),
    })),

  clearSessions: () => set({ sessions: [] }),
}));
