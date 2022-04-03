import fs from 'fs';

export async function showDataFileForEditing(dataFilePath: string): Promise<string> {
  const data = await fs.promises.readFile(dataFilePath, 'utf-8');
  return `
  <html>
  <head>
    <title>Edit TV shows list </title>
  </head>
  <body>
    <form action="/edit" method="post" enctype="application/x-www-form-urlencoded">
      <div>
        <textarea style="font-family: monospace; font-size: 14px" name="text" rows="40" cols="100">${data}</textarea>
      </div>
      <div>
        <input type="submit" />
      </div>
    </form>
  </body>
  </html>
  `
}

export async function saveEditedDataFile(text: string, dataFilePath: string): Promise<void> {
  return fs.promises.writeFile(dataFilePath, text, 'utf-8');
}
