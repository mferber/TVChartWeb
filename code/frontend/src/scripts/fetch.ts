export async function fetchRawData(): Promise<string> {
  return await (await fetch('./data')).text();
}
