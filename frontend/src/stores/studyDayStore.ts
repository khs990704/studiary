import { create } from 'zustand';
import type { StudyDay, HeatmapData } from '../types/studyDay';
import * as studyDaysApi from '../api/studyDays';
import * as heatmapApi from '../api/heatmap';

interface StudyDayState {
  studyDays: StudyDay[];
  heatmapData: HeatmapData | null;
  selectedDate: string | null;
  loading: boolean;
  setSelectedDate: (date: string | null) => void;
  fetchStudyDays: (year: number, month: number) => Promise<void>;
  fetchHeatmap: (year: number, month: number) => Promise<void>;
}

export const useStudyDayStore = create<StudyDayState>((set) => ({
  studyDays: [],
  heatmapData: null,
  selectedDate: null,
  loading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchStudyDays: async (year, month) => {
    set({ loading: true });
    try {
      const data = await studyDaysApi.getStudyDays(year, month);
      set({ studyDays: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchHeatmap: async (year, month) => {
    try {
      const data = await heatmapApi.getHeatmap(year, month);
      set({ heatmapData: data });
    } catch {
      // silently fail
    }
  },
}));
