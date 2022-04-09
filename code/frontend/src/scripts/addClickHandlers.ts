import {boxHeight, interSegmentSpacing, outerStrokeWidth, dividerStrokeWidth} from './metrics';

export default function (): void {
  const qs = document.querySelectorAll('svg');
  qs.forEach(svg => {
    svg.addEventListener('click', handleClick);
  });
  
  function handleClick(e: MouseEvent): void {
    const svg = findSVGParent(e.target as SVGElement);
    const showTitle = svg.dataset.title;
    const seasonNum = svg.dataset.season;
    let svgPt = toSVGPoint(e.target, e.clientX, e.clientY);
    const boxWidth = boxHeight - 2 * outerStrokeWidth;
    const boxNumber = Math.max(0, Math.floor((svgPt.x - outerStrokeWidth) / (boxWidth + dividerStrokeWidth)) + 1);
    console.log(`${showTitle}, season ${seasonNum}, episode ${boxNumber}`);
    console.log(svg);
    
  }
  
  function toSVGPoint(svg, x, y) {
    let p = new DOMPoint(x, y);
    return p.matrixTransform(svg.getScreenCTM().inverse());
  };
  
  function findSVGParent(el: SVGElement): SVGElement {
    while (el.tagName !== 'svg' && el.parentElement instanceof SVGElement) {
      if (!(el = el.parentElement)) {
        return null;
      }
    }
    return el;
  }
}