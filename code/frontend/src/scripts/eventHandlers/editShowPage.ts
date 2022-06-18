import API from '../api/api';
import TVMazeApi from '../tvmaze/TVMazeApi';
import { Show } from '../types';

export async function initialize() {
  try {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id === null) {
      throw new Error(`Invalid id: ${id}`);
    }
    const idNum = parseInt(id);
    if (Number.isNaN(idNum)) {
      throw new Error(`Invalid id: ${id}`);
    }
    const show = await API.fetchShow(idNum);
    populateFields(show);
  } catch (e) {
    console.error(`Error initializing page: ${e}`);
  }

  let btn = document.getElementById('tvmaze-go') as HTMLButtonElement;
  if (btn !== null) {
    btn.addEventListener('click', clickTVmazeGoButton);
  }

  btn = document.getElementById('tvmaze-refresh') as HTMLButtonElement;
  if (btn !== null) {
    btn.addEventListener('click', clickTVmazeRefreshButton);
  }
}

function populateFields(show: Show) {
  // most fields can be populated as if this were new data from TVmaze
  refreshShowInfo(show);

  // fields not included in TVmaze data
  setShowField('source', show.location); 
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
    setShowField('tvmazeId', show.tvmazeId);
  }

  document.title = `Edit: ${show.title}`;
  if (show.title) {
    const headerShowTitle = document.querySelector('#header-show-title');
    if (headerShowTitle) {
      headerShowTitle.textContent = show.title;
    }

    setShowField('title', show.title);
  }
  if (show.length) {
    setShowField('episodeduration', show.length);
  }
  
  if (show.seasonMaps) {
    const seasonMaps = reconcileSeasonMaps(show.seasonMaps);
    setShowField('season-maps', seasonMaps.join('\n'));
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

function setShowField(fieldName: string, value: string) {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
    || document.querySelector(`textarea[name=${fieldName}]`) as HTMLTextAreaElement;
  if (fld) {
    fld.value = value;
  }
}
