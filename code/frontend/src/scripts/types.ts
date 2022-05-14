export interface Show {
  title: string,
  tvmazeId: string,
  location: string,
  length: string,
  seasonMaps: string[],
  seenThru: Marker
};

export type EpisodeCount = number | 'all';
export interface Marker {
  season: number,
  episode: EpisodeCount
};
