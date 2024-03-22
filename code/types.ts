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

export interface EpisodeDescriptor {
  seasonIndex: number,
  episodeIndex: number
}

export interface StatusUpdate {
  watched?: [EpisodeDescriptor],
  unwatched?: [EpisodeDescriptor]
}
