import { Show } from "../types";

export default class {
  static async fetchEnvironment(): Promise<Record<string, string>> {
    return (await (await fetch('./env'))).json();
  }

  static async fetchShows(): Promise<Show[]> {
    const rsp = await fetch('/shows');
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
    return await rsp.json();
  }

  static async fetchShow(id: number): Promise<Show> {
    const rsp = await fetch(`/shows/${encodeURIComponent(id)}`);
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
    return await rsp.json();
  }

  static async patchShow(id: number, patch: Partial<Show>) {
    const rsp = await fetch(`/shows/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!rsp.ok) {
      throw new Error(`Error updating show: ${rsp.statusText}`);
    }
  }

  static async storeShows(shows: Show[]): Promise<void> {
    const rsp = await fetch('/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shows)
    });
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
  }

  static async updateShowStatus(show: Show, season: number, episodesWatched: number): Promise <void> {
    const body = {seenThru: { season, episodesWatched }};
    const rsp = await fetch(`/shows/${show.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!rsp.ok) {
      throw new Error(`Error updating '${show.title} last watched to S${season} episode count ${episodesWatched}: ${rsp.statusText}`);
    }
  }
}
