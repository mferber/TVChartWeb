import TVMazeApi from "../tvmaze/TVMazeApi";
import { Show } from "../types";

export function clickTVmazeGoButton() {
  const idFld = document.querySelector('input[name=tvmazeId]');
  if (idFld === null) {
    return;
  }
  const id = (idFld as HTMLInputElement).value;
  const url = 'https://tvmaze.com/shows/' + encodeURIComponent(id);
  window.open(url, "_blank");
}

export async function clickTVmazeRefreshButton() {
  const idFld = document.querySelector('input[name=tvmazeId]') as HTMLInputElement;
  if (!idFld) {
    return;
  }
  const id = idFld.value;

  try {
    const show = await TVMazeApi.fetchShowMetadata(id);
    refreshShowInfo(show);
  } catch (e) {
    console.error(e);
  }
}

function refreshShowInfo(show: Show) {
  document.title = `Edit: ${show.title}`;
  
  const headerShowTitle = document.querySelector('#header-show-title');
  if (headerShowTitle) {
    headerShowTitle.textContent = show.title;
  }

  setShowField('title', show.title);
  setShowField('episodeduration', show.length);
  setShowField('season-maps', show.seasonMaps.join('\n'));
}

function setShowField(fieldName: string, value: string) {
  const fld = 
    document.querySelector(`input[name=${fieldName}]`) as HTMLInputElement
    || document.querySelector(`textarea[name=${fieldName}]`) as HTMLTextAreaElement;
  if (fld) {
    fld.value = value;
  }
}
