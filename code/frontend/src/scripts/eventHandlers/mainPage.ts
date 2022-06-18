import { BOX_HEIGHT, INTER_SEGMENT_SPACING, OUTER_STROKE_WIDTH, DIVIDER_STROKE_WIDTH } from '../render/graphicsConstants';
import { segmentWidth } from '../render/drawSeason';
import { Show } from '../types';
import { showSynopsis, showSynopsisLoadingIndicator } from '../render/synopsis';
import { dismissSynopsis } from '../render/synopsis';
import TVMazeApi from '../tvmaze/TVMazeApi';
import metadataCache from '../metadataCache';

export function initialize() {
  document.addEventListener('click', dismissSynopsis);

  // prevent events in the synopsis from affecting the main page
  const synopsis = document.querySelector('#synopsis-popup');
  if (synopsis) {
    synopsis.addEventListener('click', e => e.stopPropagation());
  }
}

export function createSeasonClickHandler(show: Show, seasonNum: number): (_: MouseEvent) => void {
  return async (e: MouseEvent): Promise<void> => {
    const boxIndex = clientXYToBoxIndex(e.target as SVGElement, e.clientX, e.clientY, show, seasonNum);
    if (boxIndex === null) {
      return;
    }

    showSynopsisLoadingIndicator();

    if (!metadataCache.hasOwnProperty(show.title)) {
      metadataCache[show.title] = await TVMazeApi.fetchEpisodesMetadata(show, seasonNum);
    }

    const metadata = metadataCache[show.title][seasonNum][boxIndex];
    showSynopsis(
      show,
      seasonNum,
      boxIndex,
      metadata.episode,
      metadata.title,
      metadata.length,
      metadata.synopsis
    );

    e.stopPropagation();
  }
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

  let segmentOffset = 0;
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
