import {Show} from './types';

export function showSynopsis(show: Show, seasonNum: number, episodeNum: number, episodeTitle: string, synopsis: string) {
  const infoContainer = document.querySelector('#synopsis-popup') as HTMLElement;
  if (!infoContainer) {
    return;
  }

  populate(infoContainer, '#synopsis-show-title', show.title);
  populate(infoContainer, '#synopsis-season-num', seasonNum.toString());
  populate(infoContainer, '#synopsis-episode-num', episodeNum.toString());
  populate(infoContainer, '#synopsis-episode-title', episodeTitle);
  populate(infoContainer, '#synopsis-body', synopsis);

  
  infoContainer.style.display = 'block';
  infoContainer.querySelector('#synopsis-content')?.scrollTo(0, 0);
}

export function dismissSynopsis() {
  const infoContainer = document.querySelector('#synopsis-popup') as HTMLElement;
  if (infoContainer) {
    infoContainer.style.display = 'none';
  }
}

function populate(container: HTMLElement, selector: string, value: string) {
  const elt = container.querySelector(selector);
  if (elt) {
    elt.textContent = value;
  }
}