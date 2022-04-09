import {Season, Segment, Marker} from "./types";
import {createElementNS} from './htmlUtils';

const boxHeight = 35;
const outerStrokeWidth = boxHeight / 10;
const dividerStrokeWidth = outerStrokeWidth / 2;
const interSegmentSpacing = boxHeight * 2 / 3;

const SVG_NS = 'http://www.w3.org/2000/svg';

export default function (season: Season, seasonNum: number, seenThru: Marker): Element {
  let components: Element[] = [];
  let episodeOffset = 0;
  let x = 0;
  season.segments.forEach((segment, idx) => {
    if (idx > 0) {
      let [drawnSeparator, endX] = drawSegmentSeparator(x);
      components.push(drawnSeparator);
      x = endX;
    }
    let [drawnSegment, endX] = drawAppendedSegment(segment, episodeOffset, x, seasonNum, seenThru);
    components.push(drawnSegment);
    episodeOffset += segment.episodeCount;
    x = endX;
  });

  const svg = createElementNS('svg', SVG_NS, null, components);
  svg.setAttribute('width', x.toString());
  svg.setAttribute('height', boxHeight.toString());
  svg.setAttribute('viewBox', `0 0 ${x} ${boxHeight}`);
  return svg;
}

function drawSegmentSeparator(x: number): [Element, number] {
  const frac = 0.5;
  const lineLength = frac * Math.min(boxHeight, interSegmentSpacing);

  const horizX = x + (interSegmentSpacing - lineLength) / 2.0;
  const horizY = boxHeight / 2;
  const horiz = drawLine(horizX, horizY, horizX + lineLength, horizY, outerStrokeWidth);
  const vertX = x + interSegmentSpacing / 2;
  const vertY = (boxHeight - lineLength) / 2;
  const vert = drawLine(vertX, vertY, vertX, vertY + lineLength, outerStrokeWidth);

  const result = createElementNS('g', SVG_NS, null, [horiz, vert]);
  return [result, x + interSegmentSpacing];
}

function drawAppendedSegment(segment: Segment, episodeOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): [Element, number] {
  let x = xOffset;

  let elts = drawSegmentInterior(segment, episodeOffset, x, seasonNum, seenThru);
  let [outerBox, endX] = drawSegmentOuterBox(segment, x);
  elts.push(outerBox);
  const group = createElementNS('g', SVG_NS, null, elts);
  return [group, endX];
}

function drawSegmentOuterBox(segment: Segment, xStart: number): [Element, number] {
  const x = xStart + outerStrokeWidth / 2;
  const y = outerStrokeWidth / 2;
  const innerBoxWidth = boxHeight - 2 * outerStrokeWidth;
  const width = (segment.episodeCount * innerBoxWidth) + ((segment.episodeCount - 1) * dividerStrokeWidth) + outerStrokeWidth;
  const height = boxHeight - outerStrokeWidth;
  const rect = drawRect(x, y, width, height, outerStrokeWidth, undefined, 0); 

  const endX = xStart + width + outerStrokeWidth;
  return [rect, endX];
}

function drawSegmentInterior(segment: Segment, episodeOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): Element[] {
  let elts: Element[] = [];
  const innerBoxWidth = boxHeight - 2 * outerStrokeWidth;

  const seenCount = howManyEpisodesSeen(segment, seasonNum, episodeOffset, seenThru);

  // gray background for seen episodes
  if (seenCount > 0) {
    const grayX = xOffset + outerStrokeWidth;
    const grayY = outerStrokeWidth;
    const grayWidth = (seenCount * innerBoxWidth) + ((seenCount - 1) * dividerStrokeWidth);
    elts.push(drawRect(grayX, grayY, grayWidth, innerBoxWidth, 0, '#ccc'))
  };

  // divider lines between episodes
  for (let i = 1; i < segment.episodeCount; i++) {
    const x = xOffset + outerStrokeWidth + (i * innerBoxWidth) + ((i - 1) * dividerStrokeWidth) + dividerStrokeWidth / 2;
    elts.push(drawLine(x, 0, x, boxHeight - outerStrokeWidth / 2, outerStrokeWidth / 2));
  }

  // episode numbers
  const fontSize = innerBoxWidth / 1.75;
  for (let i = 0; i < segment.episodeCount; i++) {
    const x = xOffset + outerStrokeWidth + (i * innerBoxWidth) + (i === 0 ? 0 : i * dividerStrokeWidth) + (innerBoxWidth / 2);
    const y = outerStrokeWidth + innerBoxWidth / 2;
    const text = createElementNS('text', SVG_NS, null, [document.createTextNode((i + episodeOffset + 1).toString())]);
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('style', 'style="font-size: ${fontSize}px;');
    elts.push(text);
  }
  return elts;
}

function howManyEpisodesSeen(segment: Segment, seasonNum: number, episodeOffset: number, seenThru: Marker) {
  if (seasonNum < seenThru.season) {
    return segment.episodeCount;
  } else if (seasonNum > seenThru.season) {
    return 0;
  } else {
    if (seenThru.episode == 'all') {
      return segment.episodeCount;
    } else {
      return Math.min(Math.max(0, seenThru.episode as number - episodeOffset), segment.episodeCount);
    }
  }
}

export function drawLine(x1: number, y1: number, x2: number, y2: number, strokeWidth: number) {
  const result = createElementNS('line', SVG_NS, null, []);
  result.setAttribute('x1', x1.toString());
  result.setAttribute('y1', y1.toString());
  result.setAttribute('x2', x2.toString());
  result.setAttribute('y2', y2.toString());
  result.setAttribute('stroke', 'black');
  result.setAttribute('stroke-width', strokeWidth.toString());
  return result;
}

function drawRect(x: number, y: number, width: number, height: number, strokeWidth: number, fill?: string, fillOpacity?: number) {
  const rect = createElementNS('rect', SVG_NS, null, []);
  rect.setAttribute('x', x.toString());
  rect.setAttribute('y', y.toString());
  rect.setAttribute('width', width.toString());
  rect.setAttribute('height', height.toString());
  rect.setAttribute('stroke', 'black');
  rect.setAttribute('stroke-width', strokeWidth.toString());
  if (fill) {
    rect.setAttribute('fill', fill);
  }
  if (fillOpacity !== undefined) {
    rect.setAttribute('fill-opacity', fillOpacity.toString());
  }
  return rect;
}
