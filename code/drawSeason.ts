import {Show, Season, Segment, Marker} from "./types";

const boxHeight = 35;
const outerStrokeWidth = boxHeight / 10;
const dividerStrokeWidth = outerStrokeWidth / 2;
const interSegmentSpacing = boxHeight * 2 / 3;

export default function (show: Show, season: Season, seasonNum: number, seenThru: Marker) {
  let drawnSegments: string[] = [];
  let episodeOffset = 0;
  let xOffset = 0;
  for (let segment of season.segments) {
    let [drawnSegment, updatedEndX] = drawSegment(segment, episodeOffset, xOffset, seasonNum, seenThru);
    drawnSegments.push(drawnSegment);
    episodeOffset += segment.episodeCount;
    xOffset += updatedEndX;
  }
  return `<svg class="show-season" 
    width="${xOffset}" height="${boxHeight}"
    viewBox="0 0 ${xOffset} ${boxHeight}"
    data-showName="${show.title}"
    data-season="${seasonNum}"
    xmlns="https://www.w3.org/2000/svg">`
    + drawnSegments.join('')
    + '</svg>';
}

function drawSegment(segment: Segment, episodeOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): [string, number] {
  let x = xOffset;
  let segmentSeparator = '', separatorWidth = 0;
  if (episodeOffset > 0) {
    let [plusSign, actualSeparatorWidth] = drawPlusSeparator(xOffset);
    segmentSeparator = plusSign;
    x += actualSeparatorWidth;
  }
  const spaceBefore = xOffset === 0 ? 0 : interSegmentSpacing;
  const xStart = xOffset + spaceBefore;

  const [drawnSegmentOuterBox, finalXOffset] = drawSegmentOuterBox(segment, x);
  let innerBoxElements = drawSegmentInterior(segment, episodeOffset, x, seasonNum, seenThru);

  return [segmentSeparator + innerBoxElements + drawnSegmentOuterBox, finalXOffset];
}

function drawSegmentOuterBox(segment: Segment, xStart: number): [string, number] {
  const x = xStart + outerStrokeWidth / 2;
  const y = outerStrokeWidth / 2;
  const innerBoxWidth = boxHeight - 2 * outerStrokeWidth;
  const width = (segment.episodeCount * innerBoxWidth) + ((segment.episodeCount - 1) * dividerStrokeWidth) + outerStrokeWidth;
  const height = boxHeight - outerStrokeWidth;
  const drawnSegment = `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke-width="${outerStrokeWidth}" stroke="#000" fill-opacity="0" />`;
  const xEnd = xStart + width + outerStrokeWidth;
  return [drawnSegment, xEnd];
}

function drawSegmentInterior(segment: Segment, episodeOffset: number, xOffset: number, seasonNum: number, seenThru: Marker): string {
  let elements: string[] = [];
  const innerBoxWidth = boxHeight - 2 * outerStrokeWidth;

  const seenCount = howManyEpisodesSeen(segment, seasonNum, episodeOffset, seenThru);

  // gray background for seen episodes
  if (seenCount > 0) {
    const grayX = xOffset + outerStrokeWidth;
    const grayY = outerStrokeWidth;
    const grayWidth = (seenCount * innerBoxWidth) + ((seenCount - 1) * dividerStrokeWidth);
    elements.push(`<rect x="${grayX}" y="${grayY}" width="${grayWidth}" height="${innerBoxWidth}" stroke-opacity="0" fill="#ccc" />`);
  };

  // divider lines between episodes
  for (let i = 1; i < segment.episodeCount; i++) {
    const x = xOffset + outerStrokeWidth + (i * innerBoxWidth) + ((i - 1) * dividerStrokeWidth) + dividerStrokeWidth / 2;
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${boxHeight - outerStrokeWidth / 2}" stroke="#000" stroke-width="${outerStrokeWidth / 2}" />`);
  }

  // episode numbers
  const fontSize = innerBoxWidth / 1.75;
  for (let i = 0; i < segment.episodeCount; i++) {
    const x = xOffset + outerStrokeWidth + (i * innerBoxWidth) + (i === 0 ? 0 : i * dividerStrokeWidth) + (innerBoxWidth / 2);
    const y = outerStrokeWidth + innerBoxWidth / 2;
    elements.push(`<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="middle" style="font-size: ${fontSize}px;">${i + episodeOffset + 1}</text>`);
  }

  return elements.join('');
}

function drawPlusSeparator(xOffset: number): [string, number] {
  const frac = 0.5;
  const lineLength = frac * Math.min(boxHeight, interSegmentSpacing);

  const horizX = xOffset + (interSegmentSpacing - lineLength) / 2.0;
  const horizY = boxHeight / 2;
  let horiz = `<line x1="${horizX}" y1="${horizY}" x2="${horizX + lineLength}" y2="${horizY}" stroke="#000" stroke-width="${outerStrokeWidth}" />`

  const vertX = xOffset + interSegmentSpacing / 2;
  const vertY = (boxHeight - lineLength) / 2;
  let vert = `<line x1="${vertX}" y1="${vertY}" x2="${vertX}" y2="${vertY + lineLength}" stroke="#000" stroke-width="${outerStrokeWidth}" />`

  return [horiz + vert, interSegmentSpacing];
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
