import API from '../api/api';

export async function initialize() {
  const submitBtn = document?.querySelector('button#submit');
  const cancelBtn = document?.querySelector('button#cancel'); 
  const editor = document?.querySelector('textarea#editor') as HTMLTextAreaElement;
  
  submitBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const text = editor?.value || '';

    // FIXME: this is now missing sanitization logic; it really ought to sanitize all input anyway.
    // To fix later, or remove the option to edit data directly (replace with an opaque backup/restore
    // that does sanitize and error check)
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

