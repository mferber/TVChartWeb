import renderShows from './render/renderShows';
import showEnvironmentBanner from './render/showEnvironmentBanner';
import API from './api/api';
import { clickTVmazeGoButton } from './eventHandlers/editShowPage';
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
    fetch('/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: editor?.value
    }).then(() => location.href = '/'); // FIXME: validate the server response
  });
  cancelBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    location.href = '/index.html';
  });

  const data = await API.fetchRawData();
  if (editor) {
    editor.textContent = data;
  }
}

export async function initializeEditShow() {
  const btn = document.getElementById("tvmaze-go") as HTMLButtonElement;
  if (btn === null) {
    return;
  }
  btn.addEventListener('click', clickTVmazeGoButton);
}
