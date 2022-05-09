import {Show} from "./types";

export interface EpisodeMetadata {
  number: number | null;
  title: string;
  length: string;
  synopsis: string;
}

const tvMazeBaseUrl = 'https://api.tvmaze.com/';

export default class {
  private static async fetch(relativeUri: string): Promise<Response> {
    return fetch(tvMazeBaseUrl + relativeUri);
  }

  static async fetchEpisodesMetadata(show: Show, seasonNum: number): Promise<EpisodeMetadata[][]> {
    const response = await this.fetch(`shows/${encodeURIComponent(show.tvmazeId)}/episodes?specials=1`);
    const tvmazeResult: Record<string, unknown>[] = await response.json();

    const metadata: EpisodeMetadata[][] = [];
    for (const ep of tvmazeResult) {
      const season = ep.season as number;
      const number = ep.number as number | null;
      const name = ep.name as string;
      const runtime = ep.runtime as number;
      const summary = ((ep.summary as string) || '').replace(/<.*?>/g, '');
      
      const epMetadata: EpisodeMetadata = {
        number: number,
        title: name as string,
        length: `${runtime} min.`,
        synopsis: summary as string
      };

      if (typeof metadata[season] === 'undefined') {
        metadata[season] = [];
      }

      if (number === null) {
        metadata[season].push(epMetadata);
      } else {
        metadata[season][number] = epMetadata;
      }
    }

    return metadata;
  }
}
