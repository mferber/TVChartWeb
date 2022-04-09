import parse from './parse';
import drawSeason from './drawSeason';
import {Show, Season, Segment, EpisodeCount, Marker} from './types';
import {createElement} from './htmlUtils';

export default async function () {
  const container = document.body.querySelector('#content');
  for (let element of await displayItems()) {
    document.querySelector('#content').appendChild(element);
  }
}

async function displayItems(): Promise<HTMLElement[]> {
  const config = await parse(await (await fetch('/data')).text());
  return config.map(renderShow);
}

function renderShow(show: Show): HTMLElement {
  const title = renderTitle(show.title);
  const descr = renderDescription(show.location, show.length);
  const seasons = renderSeasons(show, show.seenThru);

  return createElement('div', 'show', [title, descr, seasons]);
}

function renderTitle(title: string): HTMLElement {
  return createElement('div', 'show-title', [document.createTextNode(title)]);
}

function renderDescription(location: string, length: string): HTMLElement {
  const text = document.createTextNode(`(${length}, ${location})`);
  return createElement('div', 'show-desc', [text]);
}

function renderSeasons(show: Show, seenThru: Marker): HTMLElement {
  const seasonLines = show.seasons
    .map((s, i) => drawSeason(show, i + 1, seenThru))
    .map(svg => createElement('div', 'show-season', [svg]));
  return createElement('div', 'show-seasons', seasonLines);
}