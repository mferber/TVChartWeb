import { Show } from "./types";

export default class {
  static async updateShowStatus(show: Show, seasonNum: number, episodeNum: number): Promise<void> {
    const body = { show: show.title, seasonNum: seasonNum, episodeNum: episodeNum };
    try {
      const r = await fetch('/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log(`Error updating '${show.title} last watched to S${seasonNum}E${episodeNum}: ${e}`);
    }
  }
}
