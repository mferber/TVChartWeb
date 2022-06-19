export interface Show {
  id: number,
  tvmazeId: string,
  title: string,
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

export interface Episode {
  tvmazeId: string;
  episode: number | null; // null for specials
  title: string;
  length: string;
  synopsis: string;
}
