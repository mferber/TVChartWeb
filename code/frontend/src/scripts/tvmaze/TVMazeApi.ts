import {Show, Episode} from "../types";

const TVMAZE_BASE_URL = 'https://api.tvmaze.com/';

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

export class TVmazeAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TVmazeAPIError';
  }
}

export class TVmazeSearchFailedError extends TVmazeAPIError {
  constructor(message: string) {
    super(message);
    this.name = 'TVmazeSearchFailedError';
  }
}

export default class {
  private static async fetch(relativeUri: string): Promise<Response> {
    return fetch(TVMAZE_BASE_URL + relativeUri);
  }

  static async fetchShowInfo(tvmazeId: string): Promise<Partial<Show>> {
    let tvmazeShow: TvMazeShow;
    let tvmazeEpisodes: TvMazeEpisode[];

    [tvmazeShow, tvmazeEpisodes] = await Promise.all([
      (await this.fetch(`shows/${encodeURIComponent(tvmazeId)}`)).json(),
      (await this.fetch(`shows/${encodeURIComponent(tvmazeId)}/episodes?specials=1`)).json()
    ]);
    
    return this.constructShow(tvmazeShow, tvmazeEpisodes);
  }

  // FIXME: to be replaced with a more robust search that handle multiple matches
  static async fetchShowInfoBySingleSearch(query: string): Promise<Partial<Show>> {
    const result = await this.fetch(`singlesearch/shows?q=${encodeURIComponent(query)}`);
    if (result.status === 404) {
      throw new TVmazeSearchFailedError(`No show titles matched query: ${query}`);
    }
    if (!result.ok) {
      throw new TVmazeSearchFailedError(result.statusText);
    }
    const tvmazeShow = await result.json() as TvMazeShow;
    const tvmazeId = tvmazeShow.id;
    if (tvmazeId === undefined) {
      throw new TVmazeAPIError('No TVmaze ID provided for this show');
    }
    const tvmazeEpisodes = await (await this.fetch(`shows/${encodeURIComponent(tvmazeId)}/episodes?specials=1`)).json()

    return this.constructShow(tvmazeShow, tvmazeEpisodes);
  }

  private static constructShow(tvmazeShow: TvMazeShow, episodes: TvMazeEpisode[]): Partial<Show> {
    const { id, name, runtime, averageRuntime } = tvmazeShow;
    const length = runtime ? runtime : averageRuntime;
    const lengthStr = length ? `${length} min.` : 'n/a';
    const seasonMaps = this.constructSeasonMaps(episodes);

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

  static async fetchSeasonDetails(show: Show, seasonNum: number): Promise<Episode[][]> {
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
        tvmazeId: id.toString(), 
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
