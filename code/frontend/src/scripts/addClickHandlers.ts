import { boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth } from './metrics';
import { segmentWidth } from './drawSeason';
import { Show, Season } from './types';

export default function (show: Show, seasonNum: number): (_: MouseEvent) => void {
  return (e: MouseEvent): void => {
    const svg = findSVGParent(e.target as SVGElement);
    if (!svg) {
      return;
    }
    if (e.target instanceof SVGGraphicsElement) {
      let svgPt = toSVGPoint(e.target, e.clientX, e.clientY);
      if (svgPt) {
        const episodeNum = episodeNumberFromPoint(svgPt, show.seasons[seasonNum - 1]);
        if (episodeNum !== null) {
          console.log(`${show.title}, season ${seasonNum}, episode ${episodeNum}`);
        } else {
          console.log(`${show.title}, season ${seasonNum}, after the first segment`);
        }
      }
    }
  }
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

function episodeNumberFromPoint(point: DOMPoint, season: Season): number | null {
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
