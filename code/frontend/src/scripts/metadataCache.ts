import { EpisodeMetadata } from "./tvmaze/TVMazeApi";

const metadataCache: Record<string, EpisodeMetadata[][]> = {};

export default metadataCache;