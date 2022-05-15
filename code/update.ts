import fs from 'fs';

// Implements PUT
export async function replaceDataFile(dataFilePath: string, text: string): Promise<void> {
  await saveDataFile(dataFilePath, text);
}

// Implements PATCH
export async function updateWatchStatus(dataFilePath: string, showTitle: string, seasonNum: number, episodesWatched: number): Promise<void> {
  const origLines = (await fs.promises.readFile(dataFilePath, 'utf-8')).split('\n');
  const updatedLines = origLines.map(line => {
    // Playing a little fast and loose here since this CSV-ish format is going to be
    // replaced with JSON soon anyway
    if (line.startsWith(showTitle)) {
      const newMarker = `, ${seasonNum}:${episodesWatched}`;
      return line.replace(/,\s*[^,]+$/, newMarker);
    }
    return line;
  });
  saveDataFile(dataFilePath, updatedLines.join('\n'));
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