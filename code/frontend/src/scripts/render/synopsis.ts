import { rerenderShow } from "./renderShows";
import { EpisodeDescriptor, Show } from '../types';
import API from "../api/api";

// store currently active event handlers, for future removal
var toggleWatchedListener: ((this: HTMLElement, ev: MouseEvent) => any) | null = null;
var markAllListener: ((this: HTMLElement, ev: MouseEvent) => any) | null = null;

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
  synopsis: string,
  watched: boolean
) {
  const container = synopsisContainer();
  if (!container) {
    return;
  }

  removeToggleWatchedListener(container);

  let episodeIdentifier = episodeNum ? `S${seasonNum}E${episodeNum}` : `S${seasonNum} — Special`;
  
  populate(container, '#synopsis-show-title', show.title);
  populate(container, '#synopsis-episode-identifier', episodeIdentifier);
  populate(container, '#synopsis-episode-title', episodeTitle);
  populate(container, '#synopsis-episode-length', episodeLength);
  populate(container, '#synopsis-body', synopsis);

  container.querySelector('#synopsis-body')?.scrollTo(0, 0);

  updateToggleWatchedLink(container, show, seasonNum, episodeIndex);
  updateMarkAllLink(container, show, seasonNum, episodeIndex);
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
  removeToggleWatchedListener(container);
}

function populate(container: HTMLElement, selector: string, value: string) {
  const elt = container.querySelector(selector);
  if (elt) {
    elt.textContent = value;
  }
}

function updateToggleWatchedLink(container: HTMLElement, show: Show, seasonNum: number, episodeIndex: number) {
  const link = container.querySelector('#synopsis-toggle-watched-link') as HTMLElement | null;
  if (link) {
    const episodeList: EpisodeDescriptor[] = [{ season: seasonNum, episodeIndex: episodeIndex }];
    const watched = show.watchedEpisodeMaps[seasonNum - 1].charAt(episodeIndex) === 'x';

    link.textContent = watched ? 'Mark unwatched' : 'Mark watched';

    removeToggleWatchedListener(container);
    toggleWatchedListener = async e => {
      e.preventDefault();
      const updatedShow = watched ?
        await API.updateShowEpisodesWatched(show.id, undefined, episodeList) :
        await API.updateShowEpisodesWatched(show.id, episodeList, undefined);
      rerenderShow(updatedShow);
      updateToggleWatchedLink(container, updatedShow, seasonNum, episodeIndex);
    };
    link.addEventListener('click', toggleWatchedListener);
  }
}

function removeToggleWatchedListener(container: HTMLElement) {
  if (toggleWatchedListener) {
    const link = container.querySelector('#synopsis-toggle-watched-link') as HTMLElement | null;
    link?.removeEventListener('click', toggleWatchedListener);
    toggleWatchedListener = null;
  }
}

function updateMarkAllLink(container: HTMLElement, show: Show, seasonNum: number, episodeIndex: number) {
  const link = container.querySelector('#synopsis-mark-all-link') as HTMLElement | null;
  if (link) {
    
    removeMarkAllListener(container);
    markAllListener = async e => {
      e.preventDefault();
      const episodeList = unwatchedEpisodesUpTo(show, seasonNum, episodeIndex);
      const updatedShow = await API.updateShowEpisodesWatched(show.id, episodeList, undefined);
      rerenderShow(updatedShow);
      updateMarkAllLink(container, updatedShow, seasonNum, episodeIndex);
    };
    link.addEventListener('click', markAllListener);
  }
}

function unwatchedEpisodesUpTo(show: Show, seasonNum: number, episodeIndex: number): EpisodeDescriptor[] {
  var episodes: EpisodeDescriptor[] = [];

  outer: for (let s = 0; s < seasonNum; s++) {
    for (let i = 0; i < show.watchedEpisodeMaps[s].length; i++) {
      if (s === seasonNum - 1 && i > episodeIndex) {
        break outer;
      }
      if (show.watchedEpisodeMaps[s].charAt(i) === '.') {
        episodes.push({ season: s + 1, episodeIndex: i });
      } 
    }
  }
  return episodes;
}

function removeMarkAllListener(container: HTMLElement) {
  if (markAllListener) {
    const link = container.querySelector('#synopsis-mark-all-link') as HTMLElement | null;
    link?.removeEventListener('click', markAllListener);
    markAllListener = null;
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
