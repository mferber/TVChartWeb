import {Show, Episode} from "../types";

interface TvMazeShow {
  id: number;
  name: string;
  runtime: number | null;
  averageRuntime: number;
}

interface TvMazeEpisode {
  season: number;
  number: number | null;
  type: string;
}

interface FullTvMazeEpisode extends TvMazeEpisode {
  id: number;
  name: string;
  runtime: number;
  summary: string;
}

const TVMAZE_BASE_URL = 'https://api.tvmaze.com/';

export default class {
  private static async fetch(relativeUri: string): Promise<Response> {
    return fetch(TVMAZE_BASE_URL + relativeUri);
  }

  static async fetchShowMetadata(tvmazeId: string): Promise<Show> {
    let showMetadata: TvMazeShow;
    let episodesMetadata: TvMazeEpisode[];

    [showMetadata, episodesMetadata] = await Promise.all([
      (await this.fetch(`shows/${encodeURIComponent(tvmazeId)}`)).json(),
      (await this.fetch(`shows/${encodeURIComponent(tvmazeId)}/episodes?specials=1`)).json()
    ]);
    
    const { id, name, runtime, averageRuntime } = showMetadata;
    const length = runtime ? runtime : averageRuntime;
    const lengthStr = length ? `${length} min.` : 'n/a';
    const seasonMaps = this.constructSeasonMaps(episodesMetadata);

    return {
      title: name,
      tvmazeId: id.toString(),
      location: "",
      length: lengthStr,
      seasonMaps,
      seenThru: { season: 0, episodesWatched: 0 }
    };
  }

  private static constructSeasonMaps(episodesMetadata: TvMazeEpisode[]): string[] {
    const maps: string[] = [];
    for (const ep of episodesMetadata) {
      this.appendSeasonMapSymbol(maps, ep);
    }
    // fill in any "holes" in the list of seasons due to bad input data (in case
    // a show lists episodes only in seasons 1 and 3, say)
    for (let i = 0; i < maps.length; i++) {
      if (!maps[i]) {
        maps[i] = "";
      }
    }

    return maps;
  }

  private static appendSeasonMapSymbol(maps: string[], episode: TvMazeEpisode) {
    const seasonIdx = episode.season - 1;
    if (!maps[seasonIdx]) {
      maps[seasonIdx] = "";
    }
    if (episode.type === 'regular') {
      maps[seasonIdx] += '.';
    } else if (episode.type === 'significant_special') {
      maps[seasonIdx] += 'S';
    }
  }

  static async fetchEpisodesMetadata(show: Show, seasonNum: number): Promise<Episode[][]> {
    const response = await this.fetch(`shows/${encodeURIComponent(show.tvmazeId)}/episodes?specials=1`);
    const tvmazeResult: FullTvMazeEpisode[] = await response.json();

    const metadata: Episode[][] = [];
    for (const ep of tvmazeResult) {
      if (ep.type === 'insignificant_special') {
        continue;
      }

      const id = ep.id;
      const season = ep.season;
      const episode = ep.number;
      const name = ep.name as string;
      const runtime = ep.runtime as number;
      const summary = ((ep.summary as string) || '').replace(/<.*?>/g, '');
      
      const epMetadata: Episode = {
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
