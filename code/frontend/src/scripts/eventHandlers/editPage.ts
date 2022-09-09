import API from '../api/api';
import TVMazeApi from '../tvmaze/TVMazeApi';
import { Show } from '../types';
import { getFieldValue, setField, isCheckboxChecked, setCheckbox, createElement, removePrecedingWhitespace } from '../htmlUtils';

let editingTVmazeId: string | null = null;

export async function initialize() {
  try {
    const showId = showIdFromQueryString(location.search);
    if (showId === null) {
      await initializeAddShow();
    } else {
      await initializeEditShow(showId);
    }

    const label = document.querySelector('label[for=favorite]');
    if (label) {
      label.addEventListener('click', clickFavoriteLabel);
    }

    updateLookUpEnabled();
    for (const fldName of ['title', 'tvmazeId']) {
      const field = document.querySelector(`input[name=${fldName}]`) as HTMLInputElement;
      if (field) {
        field.addEventListener('input', updateLookUpEnabled);
      }
    }

    updateTVmazeButtonsEnabled();
    const field = document.querySelector('input[name=tvmazeId]') as HTMLInputElement;
    if (field) {
      field.addEventListener('input', updateTVmazeButtonsEnabled);
    }
  } catch (e) {
    console.error(`Error initializing page: ${e}`);
  }
}

function showIdFromQueryString(qs: string): number | null {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if (id === null) {
    return null;
  }
  const idNum = parseInt(id);
  if (Number.isNaN(idNum)) {
    throw new Error(`Invalid id (not a number): ${id}`);
  }
  return idNum;
}

async function initializeAddShow() {
  const header = document.querySelector('#header');
  if (header) {
    header.textContent = 'Add new show';
  }
  initializeButtons();
}

async function initializeEditShow(showId: number) {
  const show = await API.fetchShow(showId);
  editingTVmazeId = show.tvmazeId;

  const tvmazeIdDisplayText = `: ${editingTVmazeId}`;

  let input = document.querySelector('input#tvmazeid') as HTMLElement;
  const label = document.querySelector('label[for=tvmazeId') as HTMLElement;
  label.style.display = 'inline';
  const text = document.createTextNode(tvmazeIdDisplayText);
  input.replaceWith(text);
  removePrecedingWhitespace(text);

  (document.getElementById('tvmaze-singlesearch') as HTMLButtonElement).style.display = 'none';
  
  let titleSection = document.getElementById('title-section') as HTMLElement;
  titleSection.style.display = 'none';

  populateFields(show);
  initializeButtons();
}

function initializeButtons() {
  let btn = document.getElementById('tvmaze-singlesearch') as HTMLButtonElement;
  btn.addEventListener('click', clickLookUpShowButton);

  btn = document.getElementById('tvmaze-go') as HTMLButtonElement;
  btn.addEventListener('click', clickTVmazeGoButton);

  btn = document.getElementById('tvmaze-refresh') as HTMLButtonElement;
  btn.addEventListener('click', clickTVmazeRefreshButton);

  btn = document.getElementById('submit') as HTMLButtonElement;
  btn.addEventListener('click', clickSubmitButton);

  btn = document.getElementById('cancel') as HTMLButtonElement;
  btn.addEventListener('click', clickCancelButton);
}

function updateLookUpEnabled() {
  const titleField = document.querySelector('input[name=title]') as HTMLInputElement;
  const tvmazeIdField = document.querySelector('input[name=tvmazeId]') as HTMLInputElement;
  const lookUpShowButton = document.querySelector('button#tvmaze-singlesearch') as HTMLButtonElement;
  
  // disable button if there's already a TVmaze id, or there's no id to look up
  lookUpShowButton.disabled = tvmazeIdField && (tvmazeIdField.value !== '' || titleField.value === '');
}

function updateTVmazeButtonsEnabled() {
  const field = document.querySelector('input[name=tvmazeId]') as HTMLInputElement;
  const disabled = field && field.value === '';

  for (const id of ['tvmaze-refresh', 'tvmaze-go']) {
    (document.querySelector(`button#${id}`) as HTMLButtonElement).disabled = disabled;
  }
}

function populateFields(show: Show) {
  // most fields can be populated as if this were new data from TVmaze
  refreshShowInfo(show);

  // fields not included in TVmaze data
  setField('source', show.location); 
  setCheckbox('favorite', show.favorite);
}

async function clickLookUpShowButton() {
  const query = getFieldValue('title');
  if (query !== null) {
    try {
      const result = await TVMazeApi.fetchShowInfoBySingleSearch(query);
      refreshShowInfo(result);
      updateLookUpEnabled();
      updateTVmazeButtonsEnabled();
    } catch (e) {
      console.error(e);
    }
  }
}

function clickTVmazeGoButton() {
  const tvmazeId = currentShowTVmazeId();
  if (tvmazeId === null) {
    return;
  }
  const url = 'https://tvmaze.com/shows/' + encodeURIComponent(tvmazeId);
  window.open(url, "_blank");
}

async function clickTVmazeRefreshButton() {
  const tvmazeId = currentShowTVmazeId();
  if (tvmazeId === null) {
    return;
  }
  try {
    let show = await TVMazeApi.fetchShowInfo(tvmazeId);
    show.id = Number(currentShowTVmazeId());
    refreshShowInfo(show);
  } catch (e) {
    console.error(e);
  }
}

function clickFavoriteLabel() {
  const box = document.querySelector('input[name=favorite]') as HTMLInputElement;
  if (box) {
    box.checked = !box.checked
  }
}

function refreshShowInfo(show: Partial<Show>) {
  if (show.tvmazeId !== undefined) {
    setField('tvmazeId', show.tvmazeId);
  }

  document.title = `${show.id === undefined ? 'Add' : 'Edit'}: ${show.title}`;
  if (show.title) {
    populateHeader(show);
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

function populateHeader(show: Partial<Show>) {
  const verb = show.id === undefined ? 'Add' : 'Edit';
  const header = document.querySelector('#header');;
  if (header) {
    while (header.firstChild) {
      header.removeChild(header.firstChild);
    }
    header.appendChild(document.createTextNode(verb + ' '));
    header.appendChild(createElement('span', 'title', [document.createTextNode(show.title || '')]));
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

async function clickSubmitButton() {
  let id: number | null = null;
  try {
    id = showIdFromQueryString(location.search);
    const patch: Partial<Show> = {};
    patch.title = getFieldValue('title') || '';
    patch.location = getFieldValue('source') || '';
    patch.length = getFieldValue('episodeduration') || '';
    patch.favorite = isCheckboxChecked('favorite') || false;

    const seasonMaps = getFieldValue('season-maps') || '';
    patch.seasonMaps = seasonMaps.split('\n');

    const tvmazeId = getFieldValue('tvmazeId');
    if (tvmazeId) {
      patch.tvmazeId = tvmazeId;
    }

    if (id === null) {
      await API.putShow(patch);
    } else {
      await API.patchShow(id, patch);
    }
    location.href = '../';
  } catch (e) {
    const verbing = id === null ? 'adding' : 'updating';
    console.error(`Error ${verbing} show: ${e}`);
  }
}

function clickCancelButton() {
  history.back();
}

function currentShowTVmazeId(): string | null {
  if (editingTVmazeId !== null) {
    return editingTVmazeId;
  } else {
    const input = document.getElementById('tvmazeId') as HTMLInputElement;
    return input.value === '' ? null : input.value;
  }
}
