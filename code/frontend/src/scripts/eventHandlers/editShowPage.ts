import API from '../api/api';
import TVMazeApi from '../tvmaze/TVMazeApi';
import { Show } from '../types';
import { getFieldValue, setField } from '../htmlUtils';


export async function initialize() {
  try {
    const showId = showIdFromQueryString(location.search);

    const show = await API.fetchShow(showId);
    populateFields(show);

    let btn = document.getElementById('tvmaze-go') as HTMLButtonElement;
    btn.addEventListener('click', clickTVmazeGoButton);

    btn = document.getElementById('tvmaze-refresh') as HTMLButtonElement;
    btn.addEventListener('click', clickTVmazeRefreshButton);

    btn = document.getElementById('submit') as HTMLButtonElement;
    btn.addEventListener('click', clickSubmitButton);
  } catch (e) {
    console.error(`Error initializing page: ${e}`);
  }
}

function showIdFromQueryString(qs: string): number {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id === null) {
    throw new Error(`Show id missing`);
  }
  const idNum = parseInt(id);
  if (Number.isNaN(idNum)) {
    throw new Error(`Invalid id (not a number): ${id}`);
  }
  return idNum;
}

function populateFields(show: Show) {
  // most fields can be populated as if this were new data from TVmaze
  refreshShowInfo(show);

  // fields not included in TVmaze data
  setField('source', show.location); 
}

export function clickTVmazeGoButton() {
  const tvmazeIdFld = document.querySelector('input[name=tvmazeId]');
  if (tvmazeIdFld === null) {
    return;
  }
  const id = (tvmazeIdFld as HTMLInputElement).value;
  const url = 'https://tvmaze.com/shows/' + encodeURIComponent(id);
  window.open(url, "_blank");
}

export async function clickTVmazeRefreshButton() {
  const tvmazeIdFld = document.querySelector('input[name=tvmazeId]') as HTMLInputElement;
  if (!tvmazeIdFld) {
    return;
  }
  const id = tvmazeIdFld.value;

  try {
    const show = await TVMazeApi.fetchShowMetadata(id);
    refreshShowInfo(show);
  } catch (e) {
    console.error(e);
  }
}

function refreshShowInfo(show: Partial<Show>) {
  if (show.tvmazeId !== undefined) {
    setField('tvmazeId', show.tvmazeId);
  }

  document.title = `Edit: ${show.title}`;
  if (show.title) {
    const headerShowTitle = document.querySelector('#header-show-title');
    if (headerShowTitle) {
      headerShowTitle.textContent = show.title;
    }

    setField('title', show.title);
  }
  if (show.length) {
    setField('episodeduration', show.length);
  }
  
  if (show.seasonMaps) {
    const seasonMaps = reconcileSeasonMaps(show.seasonMaps);
    setField('season-maps', seasonMaps.join('\n'));
  }
}

// Because season separators are unique to this app, entered by the user, and
// not included in the TVmaze data, we will preserve them where they're the only
// difference between what's currently in the field and what we got from TVmaze.
function reconcileSeasonMaps(seasonMaps: string[]): string[] {
  const textarea = document.querySelector('textarea[name=season-maps]') as HTMLTextAreaElement;
  if (!textarea) {
    return seasonMaps;
  }
  const currentMaps = textarea.value.split('\n');

  let reconciledMaps = [];
  for (let i = 0; i < seasonMaps.length; i++) {
    if (i < currentMaps.length && currentMaps[i].includes('+'))  {
      const stripped = currentMaps[i].replace(/\+/g, '');
      if (stripped === seasonMaps[i]) {
        reconciledMaps[i] = currentMaps[i];
        continue;
      }
    }
    reconciledMaps[i] = seasonMaps[i];
  }
  return reconciledMaps;
}

export async function clickSubmitButton() {
  const patch: Partial<Show> = {};
  patch.title = getFieldValue('title') || '';
  patch.location = getFieldValue('source') || '';
  patch.length = getFieldValue('episodeduration') || '';
  patch.tvmazeId = getFieldValue('tvmazeId') || '';

  const seasonMaps = getFieldValue('season-maps') || '';
  patch.seasonMaps = seasonMaps.split('\n');
  
  try {
    const id = showIdFromQueryString(location.search);
    await API.patchShow(id, patch);
    location.href = '../';
  } catch (e) {
    console.error(`Error updating show: ${e}`);
  }
}
