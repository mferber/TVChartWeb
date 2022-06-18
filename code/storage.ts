import {Show} from './types';
import * as fs from 'fs';

const dataFilePath = '../data/data.json';

export class StorageError extends Error {
  message: string;
  orig: Error | undefined;

  constructor(message: string, orig?: Error) {
    super();
    this.message = message
    this.orig = orig;
  }
}

export class ShowNotFoundError extends StorageError {
  constructor(id: number) {
    super(`Show not found with id ${id}`, undefined);
  }
}

export async function fetchShows(): Promise<Show[]> {
  try {
    return JSON.parse(await readDataFile());
  } catch (e) {
    let orig: Error = e instanceof Error ? e as Error : new Error(String(e));
    throw new StorageError('Error reading data file', orig);
  }
}

export async function storeShows(shows: Show[]) {
  try {
    await writeDataFile(JSON.stringify(shows, null, 2)); // pretty-print for readability
  } catch (e) {
    let orig: Error = e instanceof Error ? e as Error : new Error(String(e));
    throw new StorageError('Error writing data file', orig);
  }
}

export async function fetchShow(id: number): Promise<Show> {
  const show = (await fetchShows()).find(s => s.id === id);
  if (show) {
    return show;
  }
  throw new ShowNotFoundError(id);
}

export async function patchShow(id: number, patch: Partial<Show>) {
  let patched = false;
  const allShows = await fetchShows();
  for (let show of allShows) {
    if (show.id === id) {
      Object.assign(show, patch);
      patched = true;
    }
  }
  if (patched) {
    await storeShows(allShows);
  } else {
    throw new ShowNotFoundError(id);
  }
}

async function readDataFile(): Promise<string> {
  return fs.promises.readFile(dataFilePath, 'utf-8');
}

async function writeDataFile(text: string): Promise<void> {
  const tempFilePath = dataFilePath + '.tmp'
  await fs.promises.writeFile(tempFilePath, text, 'utf-8');
  await fs.promises.rename(tempFilePath, dataFilePath);
}