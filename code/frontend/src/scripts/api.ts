import { Show } from "./types";

async function updateShowStatus(show: Show, seasonNum: number, episodeNum: number) {
  const body = { show: show.title, seasonNum: seasonNum, episodeNum: episodeNum };
  const rsp = await fetch('/data', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  location.reload();
}
