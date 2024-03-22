import { BOX_HEIGHT, INTER_SEGMENT_SPACING, OUTER_STROKE_WIDTH, DIVIDER_STROKE_WIDTH } from '../render/graphicsConstants';
import { segmentWidth } from '../render/drawSeason';
import { Show } from '../types';
import { showSynopsis, showSynopsisLoadingIndicator } from '../render/synopsis';
import { dismissSynopsis } from '../render/synopsis';
import { removeShow } from '../render/renderShows';
import API from '../api/api';
import TVMazeApi from '../tvmaze/TVMazeApi';
import metadataCache from '../metadataCache';
import renderShows from '../render/renderShows';
import showEnvironmentBanner from '../render/showEnvironmentBanner';
import { HEART_REGULAR_PATH, HEART_SOLID_PATH } from '../render/assets';

export let showFavoritesOnlyEnabled = false;

export async function initialize() {
  showFavoritesOnlyEnabled = localStorage.getItem('favorites-mode') === 'true';
  updateFavoritesModeIndicator(showFavoritesOnlyEnabled);

  const showFavoritesButton = document.querySelector('#show-favorites');
  if (showFavoritesButton) {
    showFavoritesButton.addEventListener('click', toggleShowFavorites);
  }
  updateShowFavoritesButton(showFavoritesOnlyEnabled);

  document.addEventListener('click', dismissSynopsis);

  // prevent events in the synopsis from affecting the main page
  const synopsis = document.querySelector('#synopsis-popup');
  if (synopsis) {
    synopsis.addEventListener('click', e => e.stopPropagation());
  }
  
  return Promise.all([showEnvironmentBanner(), renderShows()]);
}

export function createSeasonClickHandler(show: Show, seasonNum: number): (_: MouseEvent) => void {
  return async (e: MouseEvent): Promise<void> => {
    const episodeIndex = clientXYToBoxIndex(e.target as SVGElement, e.clientX, e.clientY, show, seasonNum);
    if (episodeIndex === null) {
      return;
    }

    showSynopsisLoadingIndicator();

    if (!metadataCache.hasOwnProperty(show.title)) {
      metadataCache[show.title] = await TVMazeApi.fetchSeasonDetails(show, seasonNum);
    }

    const metadata = metadataCache[show.title][seasonNum][episodeIndex];
    const watched = show.watchedEpisodeMaps[seasonNum - 1].charAt(episodeIndex) === 'x';
    showSynopsis(
      show,
      seasonNum,
      episodeIndex,
      metadata.episode,
      metadata.title,
      metadata.length,
      metadata.synopsis,
      watched
    );

    e.stopPropagation();
  }
}

export function updateFavoritesModeIndicator(enabled: boolean) {
  const el = document.querySelector('body');
  if (el ===  null) { return; }
  if (enabled) {
    el.classList.add("favoritesMode");
  } else {
    el.classList.remove("favoritesMode");
  }
}

export function updateShowFavoritesButton(enabled: boolean) {
  const el = document.querySelector('#show-favorites');
  if (el === null) { return; }
  const src = enabled ? HEART_SOLID_PATH : HEART_REGULAR_PATH;
  el.setAttribute('src', src);
}

function toggleShowFavorites() {
  showFavoritesOnlyEnabled = !showFavoritesOnlyEnabled;
  localStorage.setItem('favorites-mode', showFavoritesOnlyEnabled.toString());
  updateFavoritesModeIndicator(showFavoritesOnlyEnabled);
  updateShowFavoritesButton(showFavoritesOnlyEnabled);
  renderShows();
}

function clientXYToBoxIndex(
  element: SVGElement,
  clientX: number,
  clientY: number,
  show: Show,
  seasonNum: number
): number | null {
  const svg = findSVGParent(element as SVGElement);
  if (svg instanceof SVGGraphicsElement) {
    let svgPt = toSVGPoint(svg, clientX, clientY);
    if (svgPt) {
      return svgPointToBoxIndex(svgPt, show.seasonMaps[seasonNum - 1]);
    }
  }
  return null;
}

function findSVGParent(el: SVGElement): SVGGraphicsElement | null {
  while (el.tagName !== 'svg' && el.parentElement instanceof SVGElement) {
    if (!(el = el.parentElement)) {
      return null;
    }
  }
  return el instanceof SVGGraphicsElement ? el : null;
}

function toSVGPoint(svg: SVGGraphicsElement, x: number, y: number): DOMPoint | null {
  let p = new DOMPoint(x, y);
  return p.matrixTransform(svg.getScreenCTM()?.inverse());
};

function svgPointToBoxIndex(point: DOMPoint, seasonMap: string): number | null {
  const boxWidth = BOX_HEIGHT - 2 * OUTER_STROKE_WIDTH;

  let segmentOffset = BOX_HEIGHT; // leave room for the season number
  let boxCountOffset = 0;
  const segmentMaps = seasonMap.split('+');
  for (let segmentIndex = 0; segmentIndex < segmentMaps.length; segmentIndex++) {
    const segmentMap = segmentMaps[segmentIndex];
    const boxIndex = Math.floor((point.x - segmentOffset - OUTER_STROKE_WIDTH) / (boxWidth + DIVIDER_STROKE_WIDTH));
    if (boxIndex >= 0 && boxIndex < segmentMap.length) {
      return boxIndex + boxCountOffset;
    }
    segmentOffset += segmentWidth(segmentMap.length) + INTER_SEGMENT_SPACING;
    boxCountOffset += segmentMap.length;
  }
  return null;
}

export async function confirmDeleteShow(show: Show): Promise<void> {
  if (!confirm(`Are you sure you want to delete "${show.title}"?`)) {
    return;
  }
  try {
    await API.deleteShow(show.id);
    removeShow(show);
  } catch (e) {
    console.error(e);
  }
}
