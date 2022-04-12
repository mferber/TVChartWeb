import parse from './parse';
import drawSeason from './drawSeason';
import {Show, Season, Segment, EpisodeCount, Marker} from './types';
import {createElement} from './htmlUtils';
import createClickHandler from './createClickHandler';

export default async function () {
  const container = document.body.querySelector('#content');
  for (let element of await displayItems()) {
    document.querySelector('#content')?.appendChild(element);
  }
}

async function displayItems(): Promise<HTMLElement[]> {
  const config = await parse(await (await fetch('/data')).text());
  return sortShows(config).map(renderShow);
}

function sortShows(shows: Show[]): Show[] {
  return shows.map(withSortableTitle)
    .sort((a, b): number => { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0 })
    .map(([, show]) => show);
}

function withSortableTitle(show: Show): [string, Show] {
  const sortableTitle = show.title.toLocaleLowerCase().replace(/^(an?|the)\s/, '');
  console.log(sortableTitle);
  return [sortableTitle, show];
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
  const seasonSVGs = show.seasons
    .map((season, seasonIndex) => drawSeason(show, seasonIndex + 1, seenThru));
  seasonSVGs.forEach((svg, i) => svg.addEventListener('click', createClickHandler(show, i + 1)));
  const divs = seasonSVGs.map(svg => createElement('div', 'show-season', [svg]));
  return createElement('div', 'show-seasons', divs);
}