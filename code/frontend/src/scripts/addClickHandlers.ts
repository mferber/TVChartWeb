import { DefaultDeserializer } from 'v8';
import {boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth} from './metrics';

export default function (): void {
  const qs = document.querySelectorAll('svg');
  qs.forEach(svg => {
    svg.addEventListener('click', handleClick);
  });
  
  function handleClick(e: MouseEvent): void {
    const svg = findSVGParent(e.target as SVGElement);
    if (!svg) {
      return;
    }
    if (e.target instanceof SVGGraphicsElement) {
      let svgPt = toSVGPoint(e.target, e.clientX, e.clientY);
      if (svgPt) {
        const boxWidth = boxHeight - 2 * outerStrokeWidth;
        const boxNumber = Math.max(0, Math.floor((svgPt.x - outerStrokeWidth) / (boxWidth + dividerStrokeWidth)) + 1);
        console.log(`${svg.dataset.title}, season ${svg.dataset.season}, episode ${boxNumber}`);
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
}