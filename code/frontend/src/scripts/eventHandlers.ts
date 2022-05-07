import { boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth } from './metrics';
import { segmentWidth } from './drawSeason';
import { Show, Season } from './types';
import { showSynopsis, showSynopsisLoadingIndicator } from './synopsis';

export function createSeasonClickHandler(show: Show, seasonNum: number): (_: MouseEvent) => void {
  return async (e: MouseEvent): Promise<void> => {
    const episodeNum = episodeNumberFromClientXY(e.target as SVGElement, e.clientX, e.clientY, show, seasonNum);
    if (episodeNum === null) {
      return;
    }

    showSynopsisLoadingIndicator();

    setTimeout(() =>
      showSynopsis(
        show,
        seasonNum,
        episodeNum,
        "The City on the Edge of Forever",
        "48 min.",
        "Doctor Leonard McCoy (DeForest Kelley) accidentally overdoses himself with a dangerous drug. While not in his right mind, McCoy transports himself down to a mysterious planet and travels back in time through the Guardian of Forever, after which he changes history to such an extent that the Federation of Planets no longer exists. Captain Kirk (William Shatner) and Spock (Leonard Nimoy) follow McCoy to 1930 New York and attempt to discover how he changed history and restore their timeline. While in the past, Kirk falls in love with social worker Edith Keeler (Joan Collins) and is shocked when he and Spock realize that, in order to save his future, he must allow Keeler to die in a traffic accident."
      ),
      1000
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
