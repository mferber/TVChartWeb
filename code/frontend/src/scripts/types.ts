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
  episodesWatched: EpisodeCount
};

export interface EpisodeMetadata {
  id: number;
  episode: number | null; // null for specials
  title: string;
  length: string;
  synopsis: string;
}
