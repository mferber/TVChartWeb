export {default as renderShows} from './renderShows';
export {default as showEnvironmentBanner} from './showEnvironmentBanner';

export async function fetchRawData(): Promise<string> {
  return await (await fetch('./data')).text();
}
