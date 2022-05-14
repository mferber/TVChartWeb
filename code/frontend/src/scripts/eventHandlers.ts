import { boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth } from './metrics';
import { segmentWidth } from './drawSeason';
import { Show } from './types';
import { showSynopsis, showSynopsisLoadingIndicator } from './synopsis';
import TVMazeApi from './TVMazeApi';
import metadataCache from './metadataCache';

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
  const boxWidth = boxHeight - 2 * outerStrokeWidth;

  let segmentOffset = 0;
  let boxCountOffset = 0;
  const segmentMaps = seasonMap.split('+');
  for (let segmentIndex = 0; segmentIndex < segmentMaps.length; segmentIndex++) {
    const segmentMap = segmentMaps[segmentIndex];
    const boxIndex = Math.floor((point.x - segmentOffset - outerStrokeWidth) / (boxWidth + dividerStrokeWidth));
    if (boxIndex >= 0 && boxIndex < segmentMap.length) {
      return boxIndex + boxCountOffset;
    }
    segmentOffset += segmentWidth(segmentMap.length) + interSegmentSpacing;
    boxCountOffset += segmentMap.length;
  }
  return null;
}
