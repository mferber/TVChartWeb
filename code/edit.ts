import fs from 'fs';

export async function saveEditedDataFile(text: string, dataFilePath: string): Promise<void> {
  const tempFilePath = dataFilePath + '.tmp'
  await fs.promises.writeFile(tempFilePath, text, 'utf-8');
  await fs.promises.rename(tempFilePath, dataFilePath);
}
