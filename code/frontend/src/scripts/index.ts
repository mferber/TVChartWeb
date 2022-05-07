import renderShows from './renderShows';
import showEnvironmentBanner from './showEnvironmentBanner';
import { fetchRawData } from './fetch';
import { dismissSynopsis } from './synopsis';

export async function initializeMain() {
  document.addEventListener('click', () => dismissSynopsis());

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

  const data = await fetchRawData();
  if (editor) {
    editor.textContent = data;
  }
}
