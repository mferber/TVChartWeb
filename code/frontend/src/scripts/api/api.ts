import { Show } from "../types";

export default class {
  static async fetchEnvironment(): Promise<Record<string, string>> {
    return (await (await fetch('./env'))).json();
  }

  static async fetchShows(): Promise<Show[]> {
    return await (await fetch('/shows')).json();
  }

  static async storeShows(shows: Show[]): Promise<void> {
    await fetch('/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shows)
    });
  }

  static async updateShowStatus(show: Show, season: number, episodesWatched: number): Promise < void> {
    const body = {seenThru: { season, episodesWatched }};
    try {
      const r = await fetch(`/shows/${show.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log(`Error updating '${show.title} last watched to S${season} episode count ${episodesWatched}: ${e}`);
    }
  }
}
