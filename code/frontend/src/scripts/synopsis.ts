import { syncBuiltinESMExports } from 'module';
import {Show} from './types';

export function showSynopsisLoadingIndicator() {
  const container = synopsisContainer();
  if (!container) {
    return;
  }

  setContentVisible(container, false);
  setLoadingIndicatorVisible(container, true);
  setPopupVisible(container, true);
}

export function showSynopsis(show: Show, seasonNum: number, episodeNum: number, episodeTitle: string, episodeLength: string, synopsis: string) {
  const container = synopsisContainer();
  if (!container) {
    return;
  }
  
  populate(container, '#synopsis-show-title', show.title);
  populate(container, '#synopsis-season-num', seasonNum.toString());
  populate(container, '#synopsis-episode-num', episodeNum.toString());
  populate(container, '#synopsis-episode-title', episodeTitle);
  populate(container, '#synopsis-episode-length', episodeLength);
  populate(container, '#synopsis-body', synopsis);

  container.querySelector('#synopsis-body')?.scrollTo(0, 0);

  setLoadingIndicatorVisible(container, false);
  setContentVisible(container, true);
  setPopupVisible(container, true);
}

function populate(container: HTMLElement, selector: string, value: string) {
  const elt = container.querySelector(selector);
  if (elt) {
    elt.textContent = value;
  }
}

export function dismissSynopsis() {
  const container = synopsisContainer();
  if (!container) {
    return;
  }
  
  setLoadingIndicatorVisible(container, false);
  setContentVisible(container, false);
  setPopupVisible(container, false);
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
