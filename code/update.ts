import fs from 'fs';

// Implements PUT
export async function replaceDataFile(dataFilePath: string, text: string): Promise<void> {
  await saveDataFile(dataFilePath, text);
}

// Implements PATCH
export async function updateWatchStatus(dataFilePath: string, showTitle: string, seasonNum: number, episodesWatched: number): Promise<void> {
  try {
    const data = JSON.parse(await fs.promises.readFile(dataFilePath, 'utf-8'));
    for (const show of data) {
      if (show.title === showTitle) {
        show.seenThru.season = seasonNum;
        show.seenThru.episodesWatched = episodesWatched;
        break;
      }
    }
    saveDataFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("ERROR updating data file:", e);
  }
}

async function saveDataFile(dataFilePath: string, text: string) {
  try {
    const tempFilePath = dataFilePath + '.tmp'
    await fs.promises.writeFile(tempFilePath, text, 'utf-8');
    await fs.promises.rename(tempFilePath, dataFilePath);
  } catch (e) {
    console.log("ERROR saving data file:", e);
  }
}