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
  
  const seasonMaps = reconcileSeasonMaps(show.seasonMaps);
  setShowField('season-maps', seasonMaps.join('\n'));
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
      const stripped = currentMaps[i].replaceAll('+', '');
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
