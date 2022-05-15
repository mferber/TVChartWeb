import {Show, EpisodeCount, Marker} from "./types";

const reComment = new RegExp('//.*');

export default function parseShows(config: string): Show[] {
  let shows: Show[] = [];
  const lines: string[] = config
    .split('\n')
    .map(ln => ln.replace(reComment, '').trim())
    .filter(ln => ln.length > 0);

  lines:
  for (const line of lines) {
    const fields = line.split(',').map(f => f.trim());

    if (fields.length < 5) {
      notifyInvalid(line);
      continue lines;
    }

    let episodeMap: string;
    const seasonMaps = parseSeasonMaps(fields[4]);
    if (seasonMaps === null) {
      notifyInvalid(line);
      continue lines;
    }

    let seenThru: Marker | null = null;
    if (fields[5] === '0' || fields[5] === 'unstarted') {
      seenThru = { season: 0, episodesWatched: 0 };
    } else {
      let seenThruMatch = /^(\d+)(?:\:(\d+))?$/.exec(fields[5]);
      if (seenThruMatch) {
        let season = Number(seenThruMatch[1]);
        let episodesWatched: EpisodeCount = 0;
        if (seenThruMatch[2] === undefined) {
          episodesWatched = 'all';
        } else {
          episodesWatched = Number(seenThruMatch[2]) || 0
        }
        seenThru = { season: season, episodesWatched: episodesWatched };
      } else {
        notifyInvalid(line);
        continue lines;
      }
    }

    shows.push({
      title: fields[0],
      tvmazeId: fields[1],
      location: fields[2],
      length: fields[3],
      seasonMaps: seasonMaps,
      seenThru: seenThru
    });
  }

  return shows;
}

function parseSeasonMaps(allSeasonsDescriptor: string): string[] | null {
  const seasonMaps: string[] = [];
  const seasonDescriptors = allSeasonsDescriptor.split('|');

  for (let seasonDescriptor of seasonDescriptors) {
    const segmentMaps: string[] = [];
    const segmentDescriptors = seasonDescriptor.split('+');
    
    for (let segmentDescriptor of segmentDescriptors) {
      const asNumber = parseInt(segmentDescriptor);

      if (!isNaN(asNumber)) {

        // old format: number of episodes
        segmentMaps.push('.'.repeat(asNumber));

      } else if (/^[\.S]+$/.test(segmentDescriptor)) {

        // valid new format: * for special, . for episode
        segmentMaps.push(segmentDescriptor);
      
      } else {

        // can't parse: line is invalid
        return null;

      }
    }
    seasonMaps.push(segmentMaps.join('+'));
  }
  return seasonMaps;
}

function notifyInvalid(line: string) {
  console.error(`Invalid input line: "${line}"`);
}