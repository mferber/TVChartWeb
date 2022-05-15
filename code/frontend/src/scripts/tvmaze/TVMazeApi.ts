import {Show} from "../types";

export interface EpisodeMetadata {
  id: number;
  episode: number | null; // null for specials
  title: string;
  length: string;
  synopsis: string;
}

const TVMAZE_BASE_URL = 'https://api.tvmaze.com/';

export default class {
  private static async fetch(relativeUri: string): Promise<Response> {
    return fetch(TVMAZE_BASE_URL + relativeUri);
  }

  static async fetchEpisodesMetadata(show: Show, seasonNum: number): Promise<EpisodeMetadata[][]> {
    const response = await this.fetch(`shows/${encodeURIComponent(show.tvmazeId)}/episodes?specials=1`);
    const tvmazeResult: Record<string, unknown>[] = await response.json();

    const metadata: EpisodeMetadata[][] = [];
    for (const ep of tvmazeResult) {
      if (ep.type === 'insignificant_special') {
        continue;
      }

      const id = ep.id as number;
      const season = ep.season as number;
      const episode = ep.number as number | null;
      const name = ep.name as string;
      const runtime = ep.runtime as number;
      const summary = ((ep.summary as string) || '').replace(/<.*?>/g, '');
      
      const epMetadata: EpisodeMetadata = {
        id, 
        episode,
        title: name as string,
        length: `${runtime} min.`,
        synopsis: summary as string
      };

      if (typeof metadata[season] === 'undefined') {
        metadata[season] = [];
      }

      metadata[season].push(epMetadata);
    }

    return metadata;
  }
}
