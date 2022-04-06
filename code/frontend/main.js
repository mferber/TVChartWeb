const boxHeight = 35;
const outerStrokeWidth = boxHeight / 10;
const dividerStrokeWidth = outerStrokeWidth / 2;


document.querySelectorAll('.show-seasons svg').forEach(svg => {
  svg.addEventListener('click', handleClick);
});

function handleClick(e) {
  let svgPt = toSVGPoint(e.target, e.clientX, e.clientY);
  const boxWidth = boxHeight - 2 * outerStrokeWidth;
  boxNumber = Math.max(0, Math.floor((svgPt.x - outerStrokeWidth) / (boxWidth + dividerStrokeWidth)) + 1);
  console.log(boxNumber, findSVGParent(e.target));
}

function toSVGPoint(svg, x, y) {
  let p = new DOMPoint(x, y);
  return p.matrixTransform(svg.getScreenCTM().inverse());
};

function findSVGParent(el) {
  while (el.tagName !== 'svg') {
    if (!(el = el.parentElement)) {
      return null;
    }
  }
  return el;
}