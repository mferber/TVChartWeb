export interface Show {
  title: string,
  location: string,
  length: string,
  seasons: Season[],
  seenThru: Marker
};

export interface Season {
  segments: Segment[]
};

export interface Segment {
  episodeCount: number;
};

export type EpisodeCount = number | 'all';
export interface Marker {
  season: number,
  episode: EpisodeCount
};
