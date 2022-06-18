import renderShows from './render/renderShows';
import showEnvironmentBanner from './render/showEnvironmentBanner';
import * as MainPage from './eventHandlers/mainPage';
import * as EditShowPage from './eventHandlers/editShowPage';
import * as EditDataPage from './eventHandlers/editDataPage';

export async function initializeMain() {
  MainPage.initialize();
  return Promise.all([showEnvironmentBanner(), renderShows()]);
}

export function initializeEditData() {
  EditDataPage.initialize();
}

export async function initializeEditShow() {
   await EditShowPage.initialize();
}
