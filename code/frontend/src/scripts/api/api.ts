import { Show, EpisodeDescriptor } from "../types";

export default class {
  static async fetchEnvironment(): Promise<Record<string, string>> {
    return (await (await fetch('/v0.1/env'))).json();
  }

  static async fetchShows(): Promise<Show[]> {
    const rsp = await fetch('/v0.1/shows');
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
    return await rsp.json();
  }

  static async fetchShow(id: number): Promise<Show> {
    const rsp = await fetch(`/v0.1/shows/${encodeURIComponent(id)}`);
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
    return await rsp.json();
  }

  static async putShow(show: Partial<Show>) {
    if (!show.title) {
      throw new Error("Can't add new show: title must be provided");
    }
    const rsp = await fetch('/v0.1/shows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(show)
    });
    if (!rsp.ok) {
      throw new Error(`Error adding show: ${rsp.statusText}`);
    }
  }

  static async patchShow(id: number, patch: Partial<Show>) {
    const rsp = await fetch(`/v0.1/shows/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!rsp.ok) {
      throw new Error(`Error updating show: ${rsp.statusText}`);
    }
  }

  static async updateShowEpisodesWatched(
    id: number, 
    watched: [EpisodeDescriptor] | undefined, 
    unwatched: [EpisodeDescriptor] | undefined
  ): Promise<Show> {
    const rsp = await fetch(`/v0.1/shows/${encodeURIComponent(id)}/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        watched: watched?.map(({ season, episodeIndex }) => ({ seasonIndex: season - 1, episodeIndex: episodeIndex })),
        unwatched: unwatched?.map(({ season, episodeIndex }) => ({ seasonIndex: season - 1, episodeIndex: episodeIndex }))
      })
    })
    if (!rsp.ok) {
      throw new Error(`Error updating episodes watched: ${rsp.statusText}`);
    }
    return await rsp.json();
  }

  static async storeShows(shows: Show[]): Promise<void> {
    const rsp = await fetch('/v0.1/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shows)
    });
    if (!rsp.ok) {
      throw new Error(`Error fetching show: ${rsp.statusText}`);
    }
  }

  static async deleteShow(id: number): Promise<void> {
    const rsp = await fetch(`/v0.1/shows/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!rsp.ok) {
      throw new Error(`Error deleting show with id ${id}: ${rsp.statusText}`);
    }
  }
}
