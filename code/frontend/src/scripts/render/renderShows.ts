import drawSeason from './drawSeason';
import { Show, Marker } from '../types';
import { createElement } from '../htmlUtils';
import { createSeasonClickHandler, confirmDeleteShow, showFavoritesOnlyEnabled } from '../eventHandlers/mainPage';
import * as Animation from './animation';
import API from '../api/api';
import { PEN_SQUARE_PATH, TRASH_CAN_PATH, HEART_REGULAR_PATH, HEART_SOLID_PATH } from '../render/assets';

export default async function renderShows() {
  const shows = await displayItems();
  document.querySelector('#shows-container')?.replaceChildren(...shows);
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
  let shows = await API.fetchShows();
  if (showFavoritesOnlyEnabled) {
    shows = shows.filter(s => s.favorite);
  }
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
  const editIcon = createEditIcon(show); 
  const trashIcon = createTrashIcon(show);
  const favoriteIcon = createFavoriteIcon(show);

  return createElement('div', 'show-heading', [
    createElement('span', 'show-title', [document.createTextNode(show.title)]),
    editIcon,
    trashIcon,
    favoriteIcon
  ]);
}

function createEditIcon(show: Show) {
  const el = createElement('img', 'edit', []);
  el.setAttribute('src', PEN_SQUARE_PATH);
  el.addEventListener('click', () => {
    unhighlightIcon(el);
    location.href = `edit.html?id=${show.id}`;
  });
  return el;
}

function createTrashIcon(show: Show) {
  const el = createElement('img', 'edit', []);
  el.setAttribute('src', TRASH_CAN_PATH);
  el.addEventListener('click', () => {
    unhighlightIcon(el);
    confirmDeleteShow(show);
  });
  return el;
}

function createFavoriteIcon(show: Show) {
  const el = createElement('img', 'edit', []);
  el.setAttribute('src', iconForFavoriteState(show.favorite));
  el.addEventListener('click', async () => {
    const newState = !show.favorite;
    try {
      await API.patchShow(show.id, { favorite: newState });
      show.favorite = newState;
      el.setAttribute('src', iconForFavoriteState(newState));
      if (newState === false && showFavoritesOnlyEnabled) {
        removeShow(show);
      }
    } catch (e) {
      console.error(e);
    }
  });
  return el;
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

function iconForFavoriteState(state: boolean) {
  return state ? HEART_SOLID_PATH : HEART_REGULAR_PATH;
}

function highlightIcon(icon: HTMLElement) {
  icon.classList.add('highlight');
}

function unhighlightIcon(icon: HTMLElement) {
  icon.classList.remove('highlight');
}
