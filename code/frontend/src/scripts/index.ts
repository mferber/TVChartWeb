export {default as renderShows} from './renderShows';
export {default as addEpisodeClickHandlers} from './addClickHandlers';

export async function fetchRawData(): Promise<string> {
  return await (await fetch('./data')).text();
}
