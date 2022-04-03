import fs from 'fs';

export default async function (dataFilePath: string): Promise<string> {
  return fs.promises.readFile(dataFilePath, 'utf-8');
}