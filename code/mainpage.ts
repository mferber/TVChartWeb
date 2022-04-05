import parse from "./parse";
import drawSeason from "./drawSeason";
import {Show, Season, Marker} from "./types";
import fs from "fs";

const contentPlaceholder = '#CONTENT#';

export default async function (dataFilePath: string): Promise<string> {
  const [template, shows] = await Promise.all([
    await fs.promises.readFile('frontend/main.html', 'utf-8'),
    await parse(dataFilePath)
  ]);
  const listings = sortShows(shows)
    .map((s) => formatShow(s)).join('');
  return template.replace(contentPlaceholder, listings);
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
  const seasonLines = seasons
    .map((s, i) => drawSeason(s, i + 1, seenThru)).join('');
  return `<div class="show-seasons">${seasonLines}</div>`;
}

function escape(string: string): string {
  const coded = string.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  return coded;
}
