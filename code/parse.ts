import fs from 'fs';
import {Show, Segment, EpisodeCount} from "./types";

const reComment = new RegExp('//.*');

export default async function parseShows(path: string): Promise<Show[]> {
  let shows: Show[] = [];
  const text = await fs.promises.readFile(path, 'utf8');
  const lines: string[] = text
    .split('\n')
    .map(ln => ln.replace(reComment, '').trim())
    .filter(ln => ln.length > 0);

  lines:
  for (const line of lines) {
    const fields = line.split(',').map(f => f.trim());

    if (fields.length < 4) {
      notifyInvalid(line);
      continue lines;
    }
    let seasons = [];
    for (const season of fields[3].split('.')) {
      const segments = season.split('+').map(s => parseInt(s));
      if (segments.some(s => isNaN(s))) {
        notifyInvalid(line);
        continue lines;
      }
      const segmentObjects: Segment[] = segments.map(s => ({episodeCount: s}));
      seasons.push({segments: segmentObjects});
    };

    let seenThru = null;
    if (fields[4] === '0' || fields[4] === 'unstarted') {
      seenThru = { season: 0, episode: 0 };
    } else {
      let seenThruMatch = /^S(\d+)(?:E(\d+))?$/.exec(fields[4]);
      if (seenThruMatch) {
        let season = Number(seenThruMatch[1]);
        let episode: EpisodeCount = 0;
        if (seenThruMatch[2] === undefined) {
          episode = 'all';
        } else {
          episode = Number(seenThruMatch[2]) || 0
        }
        seenThru = { season: season, episode: episode };
      } else {
        notifyInvalid(line);
        continue lines;
      }
    }

    shows.push({
      title: fields[0],
      location: fields[1],
      length: fields[2],
      seasons: seasons,
      seenThru: seenThru
    });
  }

  return shows;
}

function notifyInvalid(line: string) {
  console.error(`Invalid input line: "${line}"`);
}