import { Show } from "./types";

export default class {
  static async updateShowStatus(show: Show, seasonNum: number, episodesWatched: number): Promise<void> {
    const body = { show: show.title, seasonNum, episodesWatched };
    try {
      const r = await fetch('/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log(`Error updating '${show.title} last watched to S${seasonNum} episode index ${episodesWatched}: ${e}`);
    }
  }
}
