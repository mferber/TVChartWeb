import { boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth } from './metrics';
import { segmentWidth } from './drawSeason';
import { Show, Season } from './types';
import { showSynopsis, showSynopsisLoadingIndicator } from './synopsis';
import TVMazeApi from './TVMazeApi';
import metadataCache from './metadataCache';

export function createSeasonClickHandler(show: Show, seasonNum: number): (_: MouseEvent) => void {
  return async (e: MouseEvent): Promise<void> => {
    const episodeNum = episodeNumberFromClientXY(e.target as SVGElement, e.clientX, e.clientY, show, seasonNum);
    if (episodeNum === null) {
      return;
    }

    showSynopsisLoadingIndicator();

    if (!metadataCache.hasOwnProperty(show.title)) {
      metadataCache[show.title] = await TVMazeApi.fetchEpisodesMetadata(show, seasonNum);
    }

    const metadata = metadataCache[show.title][seasonNum][episodeNum];
    showSynopsis(
      show,
      seasonNum,
      episodeNum,
      metadata.title,
      metadata.length,
      metadata.synopsis
    );

    e.stopPropagation();
  }
}

function episodeNumberFromClientXY(
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
      return episodeNumberFromSVGPoint(svgPt, show.seasons[seasonNum - 1]);
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

function episodeNumberFromSVGPoint(point: DOMPoint, season: Season): number | null {
  const boxWidth = boxHeight - 2 * outerStrokeWidth;

  let segmentOffset = 0;
  let episodeOffset = 0;
  for (const [segmentIndex, segment] of season.segments.entries()) {
    const boxIndex = Math.floor((point.x - segmentOffset - outerStrokeWidth) / (boxWidth + dividerStrokeWidth));
    if (boxIndex >= 0 && boxIndex < segment.episodeCount) {
      return boxIndex + 1 + episodeOffset;
    }
    segmentOffset += segmentWidth(segment.episodeCount) + interSegmentSpacing;
    episodeOffset += segment.episodeCount;
  }
  return null;
}
