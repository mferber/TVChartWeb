import * as MainPage from './eventHandlers/mainPage';
import * as EditPage from './eventHandlers/editPage';
import * as EditDataPage from './eventHandlers/editDataPage';

export async function initializeMain() {
  await MainPage.initialize();
}

export async function initializeEdit() {
   await EditPage.initialize();
}

export function initializeEditData() {
  EditDataPage.initialize();
}
