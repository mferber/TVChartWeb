import { EpisodeDescriptor, Show } from './types';
import * as fs from 'fs';

const dataFilePath = '../data/data.json';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ShowNotFoundError extends StorageError {
  constructor(id: number) {
    super(`Show not found with id ${id}`);
  }
}

export async function fetchShows(): Promise<Show[]> {
  try {
    return JSON.parse(await readDataFile());
  } catch (e) {
    let orig: Error = e instanceof Error ? e as Error : new Error(String(e));
    throw new StorageError(`Error reading data file (${e})`);
  }
}

export async function storeShows(shows: Show[]) {
  try {
    await writeDataFile(JSON.stringify(shows, null, 2)); // pretty-print for readability
  } catch (e) {
    let orig: Error = e instanceof Error ? e as Error : new Error(String(e));
    throw new StorageError(`Error writing data file: (${e})`);
  }
}

export async function fetchShow(id: number): Promise<Show> {
  const show = (await fetchShows()).find(s => s.id === id);
  if (show) {
    return show;
  }
  throw new ShowNotFoundError(id);
}

export async function storeShow(show: Partial<Show>): Promise<Show> {
  if (show.title === null) {
    throw new StorageError("Can't add show: title not provided");
  }

  try {
    const shows = await fetchShows();
    const maxId = shows.reduce<number>((id, show) => Math.max(id, show.id), 0);
    const seasonMaps = show.seasonMaps || [];
    const watchedEpisodeMaps = seasonMaps.map(season => season.replace(/\+/g, '').replace(/./g, '.'));
    const newShow: Show = {
      id: maxId + 1,
      tvmazeId: show.tvmazeId || '',
      title: show.title || '?',
      length: show.length || '',
      location: show.location || '',
      seasonMaps: seasonMaps,
      watchedEpisodeMaps: watchedEpisodeMaps,
      favorite: show.favorite || false
    };
    shows.push(newShow);
    await storeShows(shows);
    return newShow;
  } catch (e) {
    // let orig: Error = e instanceof Error ? e as Error : new Error(String(e));
    throw new StorageError(`Error adding show: ${e}`);
  }
}

export async function patchShow(id: number, patch: Partial<Show>) {
  let patched: Show | null = null;
  const allShows = await fetchShows();
  for (let show of allShows) {
    if (show.id === id) {
      Object.assign(show, patch);
      patched = show;
    }
  }
  if (patched) {
    await storeShows(allShows);
    return patched;
  } else {
    throw new ShowNotFoundError(id);
  }
}

export async function applyStatusUpdate(
  id: number, 
  watched: EpisodeDescriptor[] | undefined, 
  unwatched: EpisodeDescriptor[] | undefined
): Promise<Show> {
  const allShows = await fetchShows()
  const show = allShows.find(show => show.id === id)
  if (show) {
    if (watched !== undefined) {
      for (const descr of watched) {
        if (show.watchedEpisodeMaps.length > descr.seasonIndex && show.watchedEpisodeMaps[descr.seasonIndex].length > descr.episodeIndex) {
          const seasonMap = show.watchedEpisodeMaps[descr.seasonIndex];
          const updated = seasonMap.substring(0, descr.episodeIndex) + 'x' + seasonMap.substring(descr.episodeIndex + 1);
          show.watchedEpisodeMaps[descr.seasonIndex] = updated;
        }
      }
    }
    if (unwatched !== undefined) {
      for (const descr of unwatched) {
        if (show.watchedEpisodeMaps.length > descr.seasonIndex && show.watchedEpisodeMaps[descr.seasonIndex].length > descr.episodeIndex) {
          const seasonMap = show.watchedEpisodeMaps[descr.seasonIndex];
          const updated = seasonMap.substring(0, descr.episodeIndex) + '.' + seasonMap.substring(descr.episodeIndex + 1);
          show.watchedEpisodeMaps[descr.seasonIndex] = updated;
        }
      }
    }
    if (watched || unwatched) {
      await storeShows(allShows);
    }
    return show;
  } else {
    throw new ShowNotFoundError(id);
  }
}

export async function deleteShow(id: number) {
  const allShows = await fetchShows();
  const remainingShows = allShows.filter(s => s.id !== id);
  if (remainingShows.length === allShows.length) {
    throw new ShowNotFoundError(id);
  }
  await storeShows(remainingShows);
}

async function readDataFile(): Promise<string> {
  return fs.promises.readFile(dataFilePath, 'utf-8');
}

async function writeDataFile(text: string): Promise<void> {
  const tempFilePath = dataFilePath + '.tmp'

  // FIXME: needs a mutex
  await fs.promises.writeFile(tempFilePath, text, 'utf-8');
  await fs.promises.rename(tempFilePath, dataFilePath);
}
