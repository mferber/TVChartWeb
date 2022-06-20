import drawSeason from './drawSeason';
import { Show, EpisodeCount, Marker } from '../types';
import { createElement } from '../htmlUtils';
import { createSeasonClickHandler } from '../eventHandlers/mainPage';
import API from '../api/api';

export default async function () {
  const container = document.body.querySelector('#content');
  for (let element of await displayItems()) {
    document.querySelector('#content')?.appendChild(element);
  }
}

export function renderShow(show: Show): HTMLElement {
  const title = renderTitle(show.title, show.id);
  const descr = renderDescription(show.location, show.length);
  const seasons = renderSeasons(show, show.seenThru);

  const showDiv = createElement('div', 'show', [title, descr, seasons]);
  showDiv.id = `show-${show.id}`;
  addShowEventListeners(showDiv);
  return showDiv;
}

function addShowEventListeners(showDiv: HTMLElement) {
  showDiv.addEventListener('mouseenter', mouseEnterShowIcons);
  showDiv.addEventListener('mouseleave', mouseLeaveHideIcons);
}

export function removeShowEventListeners(showDiv: HTMLElement) {
  showDiv.removeEventListener('mouseenter', mouseEnterShowIcons);
  showDiv.removeEventListener('mouseleave', mouseLeaveHideIcons);
}

async function displayItems(): Promise<HTMLElement[]> {
  const shows = await API.fetchShows();
  return sortShows(shows).map(renderShow);
}

function sortShows(shows: Show[]): Show[] {
  return shows.map(withSortableTitle)
    .sort((a, b): number => { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0 })
    .map(([, show]) => show);
}

function withSortableTitle(show: Show): [string, Show] {
  const sortableTitle = show.title.toLocaleLowerCase().replace(/^(an?|the)\s/, '');
  return [sortableTitle, show];
}

function renderTitle(title: string, id: number): HTMLElement {
  const editIcon = createElement('img', 'edit', []);
  editIcon.setAttribute('src', 'pen-to-square-regular.svg');
  editIcon.addEventListener('click', () => { location.href = `edit.html?id=${id}`; });
  
  const trashIcon = createElement('img', 'edit', []);
  trashIcon.setAttribute('src', 'trash-can-regular.svg');

  return createElement('div', 'show-heading', [
    createElement('span', 'show-title', [document.createTextNode(title)]),
    editIcon,
    trashIcon
  ]);
}

function renderDescription(location: string, length: string): HTMLElement {
  const text = document.createTextNode(`(${length}, ${location})`);
  return createElement('div', 'show-desc', [text]);
}

function renderSeasons(show: Show, seenThru: Marker): HTMLElement {
  const seasonSVGs = show.seasonMaps
    .map((seasonMap, seasonIndex) => drawSeason(seasonMap, seasonIndex + 1, seenThru));

  seasonSVGs.forEach((svg, i) => svg.addEventListener('click', createSeasonClickHandler(show, i + 1)));

  const divs = seasonSVGs.map(svg => createElement('div', 'show-season', [svg]));
  return createElement('div', 'show-seasons', divs);
}

function mouseEnterShowIcons(evt: MouseEvent) {
  const target = evt.currentTarget as HTMLElement;
  if (target) {
    const icons = target.querySelectorAll('img.edit');
    icons.forEach(i => (i as HTMLElement).style.visibility = 'visible');
  }
}
function mouseLeaveHideIcons(evt: MouseEvent) {
  const target = evt.currentTarget as HTMLElement;
  if (target) {
    const icons = target.querySelectorAll('img.edit');
    icons.forEach(i => (i as HTMLElement).style.visibility = 'hidden');
  }
}
