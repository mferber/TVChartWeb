export interface Show {
  id: number,
  tvmazeId: string,
  title: string,
  location: string,
  length: string,
  seasonMaps: string[],
  seenThru: Marker,
  favorite: boolean
};

export type EpisodeCount = number | 'all';
export interface Marker {
  season: number,
  episodesWatched: EpisodeCount
};
