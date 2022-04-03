import fs from 'fs';

export default async function (dataFilePath: string): Promise<string> {
  const data = await fs.promises.readFile(dataFilePath, 'utf-8');
  return `
  <html>
  <head>
    <title>Edit TV shows list </title>
  </head>
  <body>
    <form>
      <div>
        <textarea style="font-family: monospace; font-size: 14px" name="data" rows="40" cols="100">${data}</textarea>
      </div>
      <div>
        <input type="submit" />
      </div>
    </form>
  </body>
  </html>
  `
}
