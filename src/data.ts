import DATA_RAW from './data.json';

export type MinimapData = {
  id: string;
  key: number;
  pos: [number, number];
  rot: number;
  playerScale: [number, number];
  playerOffset: [number, number];
};

export const DATA: MinimapData[] = (DATA_RAW as any).map((x: any) => ({ ...x, key: parseInt(x.key, 16) }));
export const DATA_MAP = new Map(DATA.map((d) => [d.id, d]));
