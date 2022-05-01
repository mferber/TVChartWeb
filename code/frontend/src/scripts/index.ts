import renderShows from './renderShows';
import showEnvironmentBanner from './showEnvironmentBanner';
import { fetchRawData } from './fetch';

export async function initializeMain() {
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
