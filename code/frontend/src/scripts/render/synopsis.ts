import { rerenderShow } from "./renderShows";
import { Show } from '../types';
import API from "../api/api";

// store currently active "Mark watched" click event handler, for future removal
var markWatchedListener: ((this: HTMLElement, ev: MouseEvent) => any) | null = null;

export function showSynopsisLoadingIndicator() {
  const container = synopsisContainer();
  if (!container) {
    return;
  }

  setContentVisible(container, false);
  setLoadingIndicatorVisible(container, true);
  setPopupVisible(container, true);
}

export function showSynopsis(
  show: Show,
  seasonNum: number,
  episodeIndex: number,
  episodeNum: number | null,
  episodeTitle: string,
  episodeLength: string,
  synopsis: string
) {
  const container = synopsisContainer();
  if (!container) {
    return;
  }

  removeMarkWatchedListener(container);

  let episodeIdentifier = episodeNum ? `S${seasonNum}E${episodeNum}` : `S${seasonNum} — Special`;
  
  populate(container, '#synopsis-show-title', show.title);
  populate(container, '#synopsis-episode-identifier', episodeIdentifier);
  populate(container, '#synopsis-episode-title', episodeTitle);
  populate(container, '#synopsis-episode-length', episodeLength);
  populate(container, '#synopsis-body', synopsis);

  container.querySelector('#synopsis-body')?.scrollTo(0, 0);

  addMarkWatchedListener(container, show, seasonNum, episodeIndex);
  setLoadingIndicatorVisible(container, false);
  setContentVisible(container, true);
  setPopupVisible(container, true);
}

export function dismissSynopsis() {
  const container = synopsisContainer();
  if (!container) {
    return;
  }
  
  setLoadingIndicatorVisible(container, false);
  setContentVisible(container, false);
  setPopupVisible(container, false);
  removeMarkWatchedListener(container);
}

function populate(container: HTMLElement, selector: string, value: string) {
  const elt = container.querySelector(selector);
  if (elt) {
    elt.textContent = value;
  }
}

function addMarkWatchedListener(container: HTMLElement, show: Show, seasonNum: number, episodeIndex: number) {
  const link = container.querySelector('#synopsis-mark-watched-link') as HTMLElement | null;
  if (link) {
    markWatchedListener = async e => {
      e.preventDefault();
      const updatedShow = await API.updateShowStatus(show, seasonNum, episodeIndex + 1);
      rerenderShow(updatedShow);
    };
    link.addEventListener('click', markWatchedListener);
  }
}

function removeMarkWatchedListener(container: HTMLElement) {
  if (markWatchedListener) {
    const link = container.querySelector('#synopsis-mark-watched-link') as HTMLElement | null;
    link?.removeEventListener('click', markWatchedListener);
    markWatchedListener = null;
  }
}

function setContentVisible(container: Element, visible: boolean) {
  const contentBlock = container.querySelector('#synopsis-content') as HTMLElement;
  if (contentBlock) {
    contentBlock.style.display = visible ? 'block' : 'none';
  }
}

function setLoadingIndicatorVisible(container: Element, visible: boolean) {
  const loadingIndicator = container.querySelector('#synopsis-loading-indicator') as HTMLElement;
  if (loadingIndicator) {
    loadingIndicator.style.display = visible ? 'block' : 'none';
  }
}

function setPopupVisible(container: HTMLElement, visible: boolean) {
  container.style.display = visible ? 'block' : 'none';
}

function synopsisContainer(): HTMLElement {
  return document.querySelector('#synopsis-popup') as HTMLElement;
}
