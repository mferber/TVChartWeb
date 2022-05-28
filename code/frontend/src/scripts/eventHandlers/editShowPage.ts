export function clickTVmazeGoButton() {
  const idFld = document.querySelector('input[name=tvmazeId]');
  if (idFld === null) {
    return;
  }
  const id = (idFld as HTMLInputElement).value;
  const url = 'https://tvmaze.com/shows/' + encodeURIComponent(id);
  window.open(url, "_blank");
}
