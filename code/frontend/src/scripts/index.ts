export {default as renderShows} from './renderShows';

export async function fetchRawData(): Promise<string> {
  return await (await fetch('./data')).text();
}
