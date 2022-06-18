import renderShows from './render/renderShows';
import showEnvironmentBanner from './render/showEnvironmentBanner';
import API from './api/api';
import { clickTVmazeGoButton, clickTVmazeRefreshButton } from './eventHandlers/editShowPage';
import { dismissSynopsis } from './render/synopsis';

export async function initializeMain() {
  document.addEventListener('click', dismissSynopsis);

  // prevent events in the synopsis from affecting the main page
  const synopsis = document.querySelector('#synopsis-popup');
  if (synopsis) {
    synopsis.addEventListener('click', e => e.stopPropagation());
  }

  return Promise.all([showEnvironmentBanner(), renderShows()]);
}

export async function initializeEditData() {
  const submitBtn = document?.querySelector('button#submit');
  const cancelBtn = document?.querySelector('button#cancel'); 
  const editor = document?.querySelector('textarea#editor') as HTMLTextAreaElement;
  
  submitBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const text = editor?.value || '';
    API.storeShows(JSON.parse(text))
      .then(() => location.href = '/');
  });

  cancelBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    location.href = '/index.html';
  });

  const shows = await API.fetchShows();
  if (editor) {
    editor.textContent = JSON.stringify(shows, null, 2);
  }
}

export async function initializeEditShow() {
  let btn = document.getElementById('tvmaze-go') as HTMLButtonElement;
  if (btn !== null) {
    btn.addEventListener('click', clickTVmazeGoButton);
  }

  btn = document.getElementById('tvmaze-refresh') as HTMLButtonElement;
  if (btn !== null) {
    btn.addEventListener('click', clickTVmazeRefreshButton);
  }
}
