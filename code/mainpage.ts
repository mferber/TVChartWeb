import parse, {Show, Season, Segment, Marker} from "./parse";

const boxHeight = 35;
const outerStrokeWidth = boxHeight / 10;
const dividerStrokeWidth = outerStrokeWidth / 2;
const interSegmentSpacing = boxHeight * 2/3;

export default async function (dataFilePath: string): Promise<string> {
  const shows = await parse(dataFilePath);
  return `
<html>
<head>
  <title>TV shows</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Alegreya&display=swap');
    body {
      font-family: "Alegreya";
    }
    #controls {
      margin: 0 0 1em 0;
    }
    .show-title {
      font-size: 2em;
      font-weight: bold;
      white-space: nowrap;
      margin: 0;
    }
    .show-desc {
      font-size: 1.25em;
      white-space: nowrap;
      margin: 0 0 0.5em 0;
    }
    .show-seasons {
      font-size: 1.5em;
      white-space: nowrap;
    }
    .show-season {
      margin: 0 0 0.5em 0;
    }
  </style>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body>
  <div id="controls">
    <a href="edit">Edit show list</a> | <a href="export" download="shows.csv">Export data file</a>
  </div>
`
    + sortShows(shows).map((s) => formatShow(s)).join("<br/>") + `
</body>
</html>`;
}

function sortShows(shows: Show[]): Show[] {
  type TaggedShow = [string, Show];
  const sortName = (sh: Show) => sh.title.replace(/^(an?|the) /i, '');
  const cmp = (a: TaggedShow, b: TaggedShow): number => {
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  }
  return shows.map(sh => [sortName(sh), sh] as TaggedShow)
    .sort(cmp)
    .map(tagged => tagged[1] as Show);
}

function formatShow(show: Show): string {
  const title = formatTitle(show.title);
  const descr = formatDescription(show.location, show.length);
  const seasons = formatSeasons(show.seasons, show.seenThru);
  return `<div class="show">${title}${descr}${seasons}</div>`;
}

function formatTitle(title: string): string {
  return `<div class="show-title">${escape(title)}</div>`;
}

function formatDescription(location: string, length: string) {
  return `<div class="show-desc">(${length}, ${escape(location)})</div>`;
}

function formatSeasons(seasons: Season[], seenThru: Marker) {
  const seasonLines = seasons.map((s, i) => formatSeason(s, i + 1, seenThru)).join("<br/>");
  return `<div class="show-seasons" onclick="console.log('click: ', event);">${seasonLines}</div>`;
}

function formatSeason(season: Season, seasonNum: number, seenThru: Marker) {
  let drawnSegments: string[] = [];
  let episodeOffset = 0;
  let xOffset = 0;
  for (let segment of season.segments) {
    let [drawnSegment, updatedEndX] = drawSegment(segment, episodeOffset, xOffset, seasonNum, seenThru);
    drawnSegments.push(drawnSegment);
    episodeOffset += segment.episodeCount;
    xOffset += updatedEndX;
  }
  return `<svg class="show-season" width="${xOffset}" height="${boxHeight}" viewBox="0 0 ${xOffset} ${boxHeight}" xmlns="https://www.w3.org/2000/svg">`
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
  
  if (seenCount > 0) {
    const grayX = xOffset + outerStrokeWidth;
    const grayY = outerStrokeWidth;
    const grayWidth = (seenCount * innerBoxWidth) + ((seenCount - 1) * dividerStrokeWidth);
    elements.push(`<rect x="${grayX}" y="${grayY}" width="${grayWidth}" height="${innerBoxWidth}" stroke-opacity="0" fill="#ccc" />`);
  };

  for (let i = 1; i < segment.episodeCount; i++) {
    // const x = xOffset + i * boxHeight + outerStrokeWidth / 2;
    const x = xOffset + outerStrokeWidth + (i * innerBoxWidth) + ((i - 1) * dividerStrokeWidth) + dividerStrokeWidth / 2;
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${boxHeight - outerStrokeWidth / 2}" stroke="#000" stroke-width="${outerStrokeWidth / 2}" />`);
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

// function unseenBox() {
//   return `<svg xmlns="https://www.w3.org/2000/svg" viewbox="0 0 ${boxHeight} ${boxHeight}" width="${boxHeight}" height="${boxHeight}">
//     <desc>Red rectangle shape</desc>
//     <rect x="0" y="0" width="${boxHeight}" height="${boxHeight}" fill="#fff" stroke="#000" />  
//   </svg>`;
// }

// function seenBox() {
//   return `<svg xmlns="https://www.w3.org/2000/svg" viewbox="0 0 ${boxHeight} ${boxHeight}" width="${boxHeight}" height="${boxHeight}">
//     <desc>Red rectangle shape</desc>
//     <rect x="0" y="0" width="${boxHeight}" height="${boxHeight}" fill="#fff" stroke="#000" stroke-width="5" />  
//     <line x1="0" y1="0" x2="${boxHeight}" y2="${boxHeight}" stroke="#000" />
//     <line x1="0" y1="${boxHeight}" x2="${boxHeight}" y2="0" stroke="#000" />
//   </svg>`;
// }

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
function escape(string: string): string {
  const coded= string.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  return coded;
}
