import API from "../api/api";

export default async function () {
  try {
    const env = await API.fetchEnvironment();
    if (env.instance) {
      showBannerMessage(`Site instance: ${env.instance}`);
    }
  } catch (e) {
    showBannerMessage(`Error looking up site instance: ${e}`);
  }
}

function showBannerMessage(message: string) {
  const dispNode = document.createElement('div');
  dispNode.className = 'instanceIdentificationBanner';
  dispNode.textContent = message;
  document.body.prepend(dispNode);
  document.body.classList.add('nonproductionInstance');
}
