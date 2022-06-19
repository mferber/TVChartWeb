import renderShows from './render/renderShows';
import showEnvironmentBanner from './render/showEnvironmentBanner';
import * as MainPage from './eventHandlers/mainPage';
import * as EditPage from './eventHandlers/editPage';
import * as EditDataPage from './eventHandlers/editDataPage';

export async function initializeMain() {
  MainPage.initialize();
  return Promise.all([showEnvironmentBanner(), renderShows()]);
}

export async function initializeEdit() {
   await EditPage.initialize();
}

export function initializeEditData() {
  EditDataPage.initialize();
}
