export interface Show {
  id: number,
  tvmazeId: string,
  title: string,
  location: string,
  length: string,
  seasonMaps: string[],
  watchedEpisodeMaps: string[],
  favorite: boolean
};

export interface Episode {
  tvmazeId: string;
  episode: number | null; // null for specials
  title: string;
  length: string;
  synopsis: string;
}

export interface EpisodeDescriptor {
  season: number,
  episodeIndex: number
}
