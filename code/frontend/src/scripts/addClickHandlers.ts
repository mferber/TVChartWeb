import {boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth} from './metrics';
import { Show } from './types';

export default function (show: Show, seasonNum: number): (_: MouseEvent) => void {
  return (e: MouseEvent): void => {
    const svg = findSVGParent(e.target as SVGElement);
    if (!svg) {
      return;
    }
    if (e.target instanceof SVGGraphicsElement) {
      let svgPt = toSVGPoint(e.target, e.clientX, e.clientY);
      if (svgPt) {
        const episodeNum = episodeNumberFromPoint(svgPt);
        console.log(`${show.title}, season ${seasonNum}, episode ${episodeNum}`);
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

function episodeNumberFromPoint(point: DOMPoint): number | null {
  const boxWidth = boxHeight - 2 * outerStrokeWidth;
  return Math.max(0, Math.floor((point.x - outerStrokeWidth) / (boxWidth + dividerStrokeWidth)) + 1);
}
