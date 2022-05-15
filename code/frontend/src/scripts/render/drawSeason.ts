import { Show, Marker } from "../types";
import { createElementNS } from '../htmlUtils';
import { BOX_HEIGHT, INTER_SEGMENT_SPACING, OUTER_STROKE_WIDTH, DIVIDER_STROKE_WIDTH } from './graphicsConstants';

const SVG_NS = 'http://www.w3.org/2000/svg';
const SPECIAL_EPISODE_MARKER = '\u2605';  // black star

export default function (seasonMap: string, seasonNum: number, seenThru: Marker): SVGElement {
  let components: Element[] = [];
  let episodeCounterOffset = 0;
  let x = 0;

  const segmentMaps = seasonMap.split('+');
  segmentMaps.forEach((segmentMap, idx) => {
    if (idx > 0) {
      let [drawnSeparator, endX] = drawSegmentSeparator(x);
      components.push(drawnSeparator);
      x = endX;
    }
    let [drawnSegment, endX] = drawAppendedSegment(segmentMap, episodeCounterOffset, x, seasonNum, seenThru);
    components.push(drawnSegment);

    const specialEpisodes = [...segmentMap].filter(c => c === 'S').length;
    episodeCounterOffset += segmentMap.length - specialEpisodes;

    x = endX;
  });

  const svg = createElementNS('svg', SVG_NS, null, components) as SVGElement;
  svg.setAttribute('width', x.toString());
  svg.setAttribute('height', BOX_HEIGHT.toString());
  svg.setAttribute('viewBox', `0 0 ${x} ${BOX_HEIGHT}`);
  return svg;
}

export function segmentWidth(episodeCount: number): number {
  const innerBoxWidth = BOX_HEIGHT - 2 * OUTER_STROKE_WIDTH;
  return (episodeCount * innerBoxWidth) + ((episodeCount - 1) * DIVIDER_STROKE_WIDTH) + OUTER_STROKE_WIDTH
}

function drawSegmentSeparator(x: number): [Element, number] {
  const frac = 0.5;
  const lineLength = frac * Math.min(BOX_HEIGHT, INTER_SEGMENT_SPACING);

  const horizX = x + (INTER_SEGMENT_SPACING - lineLength) / 2.0;
  const horizY = BOX_HEIGHT / 2;
  const horiz = drawLine(horizX, horizY, horizX + lineLength, horizY, OUTER_STROKE_WIDTH);
  const vertX = x + INTER_SEGMENT_SPACING / 2;
  const vertY = (BOX_HEIGHT - lineLength) / 2;
  const vert = drawLine(vertX, vertY, vertX, vertY + lineLength, OUTER_STROKE_WIDTH);

  const result = createElementNS('g', SVG_NS, null, [horiz, vert]);
  return [result, x + INTER_SEGMENT_SPACING];
}

function drawAppendedSegment(segmentMap: string, episodeCounterOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): [Element, number] {
  let x = xOffset;

  let elts = drawSegmentInterior(segmentMap, episodeCounterOffset, x, seasonNum, seenThru);
  let [outerBox, endX] = drawSegmentOuterBox(segmentMap, x);
  elts.push(outerBox);
  const group = createElementNS('g', SVG_NS, null, elts);
  return [group, endX];
}

function drawSegmentOuterBox(segmentMap: string, xStart: number): [Element, number] {
  const x = xStart + OUTER_STROKE_WIDTH / 2;
  const y = OUTER_STROKE_WIDTH / 2;
  const width = segmentWidth(segmentMap.length);
  const height = BOX_HEIGHT - OUTER_STROKE_WIDTH;
  const rect = drawRect(x, y, width, height, OUTER_STROKE_WIDTH, undefined, 0); 
  const endX = xStart + width + OUTER_STROKE_WIDTH;
  return [rect, endX];
}

function drawSegmentInterior(segmentMap: string, episodeCounterOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): Element[] {
  let elts: Element[] = [];
  const innerBoxWidth = BOX_HEIGHT - 2 * OUTER_STROKE_WIDTH;

  const seenCount = howManyEpisodesSeen(segmentMap, seasonNum, episodeCounterOffset, seenThru);

  // gray background for seen episodes
  if (seenCount > 0) {
    const grayX = xOffset + OUTER_STROKE_WIDTH;
    const grayY = OUTER_STROKE_WIDTH;
    const grayWidth = (seenCount * innerBoxWidth) + ((seenCount - 1) * DIVIDER_STROKE_WIDTH);
    elts.push(drawRect(grayX, grayY, grayWidth, innerBoxWidth, 0, '#ccc'))
  };

  // divider lines between episodes
  for (let i = 1; i < segmentMap.length; i++) {
    const x = xOffset + OUTER_STROKE_WIDTH + (i * innerBoxWidth) + ((i - 1) * DIVIDER_STROKE_WIDTH) + DIVIDER_STROKE_WIDTH / 2;
    elts.push(drawLine(x, 0, x, BOX_HEIGHT - OUTER_STROKE_WIDTH / 2, OUTER_STROKE_WIDTH / 2));
  }

  // episode numbers
  const fontSize = innerBoxWidth / 1.75;
  let episodeCounter = episodeCounterOffset;
  for (let i = 0; i < segmentMap.length; i++) {
    const x = xOffset + OUTER_STROKE_WIDTH + (i * innerBoxWidth) + (i === 0 ? 0 : i * DIVIDER_STROKE_WIDTH) + (innerBoxWidth / 2);
    const y = OUTER_STROKE_WIDTH + innerBoxWidth / 2;

    const label = segmentMap[i] === 'S' ? SPECIAL_EPISODE_MARKER : (++episodeCounter).toString();
    const text = createElementNS('text', SVG_NS, null, [document.createTextNode(label)]); //(++episodeCounter).toString())]);
    text.setAttribute('x', x.toString());
    text.setAttribute('y', y.toString());
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('style', 'style="font-size: ${fontSize}px;');
    text.setAttribute('fill', '#666');
    elts.push(text);
  }
  return elts;
}

function howManyEpisodesSeen(segmentMap: string, seasonNum: number, episodeCounterOffset: number, seenThru: Marker) {
  if (seasonNum < seenThru.season) {
    return segmentMap.length;
  } else if (seasonNum > seenThru.season) {
    return 0;
  } else {
    if (seenThru.episodesWatched === 'all') {
      return segmentMap.length;
    } else {
      return Math.min(Math.max(0, seenThru.episodesWatched as number - episodeCounterOffset), segmentMap.length);
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