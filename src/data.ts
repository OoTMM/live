import DATA_RAW from './data.json';

export type MinimapData = {
  id: string;
  pos: [number, number];
  rot: number;
};

export const DATA: MinimapData[] = DATA_RAW as MinimapData[];
export const DATA_MAP = new Map(DATA.map((d) => [d.id, d]));
