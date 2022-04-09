import fs from 'fs';

export async function saveEditedDataFile(text: string, dataFilePath: string): Promise<void> {
  return fs.promises.writeFile(dataFilePath, text, 'utf-8');
}
