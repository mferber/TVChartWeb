import drawSeason from './drawSeason';
import { Show, Marker } from '../types';
import { createElement } from '../htmlUtils';
import { createSeasonClickHandler, confirmDeleteShow } from '../eventHandlers/mainPage';
import * as Animation from './animation';
import API from '../api/api';

export default async function () {
  const shows = await displayItems();
  const container = createElement('div', null, shows);
  document.querySelector('#content')?.appendChild(container);
}

export function rerenderShow(show: Show) {
  const oldElement = document.querySelector(`#show-${show.id}`) as HTMLElement | null;
  if (oldElement) {
    const newElement = renderShow(show);
    removeIconEventListeners(oldElement);
    oldElement.replaceWith(newElement);
  }
}

export async function removeShow(show: Show) {
  const oldElement = document.querySelector(`#show-${show.id}`) as HTMLElement | null;
  if (oldElement) {
    removeIconEventListeners(oldElement);
    await Animation.fadeOutVertically(oldElement, 0.5);
    oldElement.remove();
  }
}

function renderShow(show: Show): HTMLElement {
  const title = renderTitle(show);
  const descr = renderDescription(show.location, show.length);
  const seasons = renderSeasons(show, show.seenThru);

  const showDiv = createElement('div', 'show', [title, descr, seasons]);
  showDiv.id = `show-${show.id}`;
  addIconEventListeners(showDiv);
  return showDiv;
}

function addIconEventListeners(showDiv: HTMLElement) {
  showDiv.querySelectorAll('img.edit').forEach(elt => {
    const icon = elt as HTMLElement;
    icon.addEventListener('mouseenter', mouseEnterIcon);
    icon.addEventListener('mouseleave', mouseLeaveIcon);
  });
}

function removeIconEventListeners(showDiv: HTMLElement) {
  showDiv.querySelectorAll('img.edit').forEach(elt => {
    const icon = elt as HTMLElement;
    icon.removeEventListener('mouseenter', mouseEnterIcon);
    icon.removeEventListener('mouseleave', mouseLeaveIcon);
  });
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

function renderTitle(show: Show): HTMLElement {
  const editIcon = createElement('img', 'edit', []);
  editIcon.setAttribute('src', 'pen-to-square-regular.svg');
  editIcon.addEventListener('click', () => {
    unhighlightIcon(editIcon);
    location.href = `edit.html?id=${show.id}`;
  });
  
  const trashIcon = createElement('img', 'edit', []);
  trashIcon.setAttribute('src', 'trash-can-regular.svg');
  trashIcon.addEventListener('click', () => {
    unhighlightIcon(trashIcon);
    confirmDeleteShow(show);
  });

  return createElement('div', 'show-heading', [
    createElement('span', 'show-title', [document.createTextNode(show.title)]),
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

function mouseEnterIcon(evt: MouseEvent) {
  const target = evt.currentTarget as HTMLElement;
  if (target) {
    highlightIcon(target);
  }
}
function mouseLeaveIcon(evt: MouseEvent) {
  const target = evt.currentTarget as HTMLElement;
  if (target) {
    unhighlightIcon(target);
  }
}

function highlightIcon(icon: HTMLElement) {
  icon.classList.add('highlight');
}

function unhighlightIcon(icon: HTMLElement) {
  icon.classList.remove('highlight');
}
