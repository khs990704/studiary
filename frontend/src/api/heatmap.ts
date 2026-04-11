import client from './client';
import type { HeatmapData } from '../types/studyDay';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export async function getHeatmap(year: number, month: number): Promise<HeatmapData> {
  const res = await client.get<ApiResponse<HeatmapData>>('/heatmap', {
    params: { year, month },
  });
  return res.data.data;
}
