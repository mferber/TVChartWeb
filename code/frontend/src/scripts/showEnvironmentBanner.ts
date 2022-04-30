export default async function () {
  try {
    const env = await fetchEnvironment();
    if (env.instance) {
      showBannerMessage(`Site instance: ${env.instance}`);
    }
  } catch (e) {
    showBannerMessage(`Error looking up site instance: ${e}`);
  }
}

async function fetchEnvironment(): Promise<Record<string, string>> {
  return (await (await fetch('./env'))).json();
}

function showBannerMessage(message: string) {
  const container = document.body.querySelector('.instanceIdentificationBanner');
  if (!container) {
    return alert("Can't find container for site instance identification banner");
  }
  const dispNode = document.createElement('div');
  dispNode.textContent = message;
  container.appendChild(dispNode);
  container.className += ' visible';
}
