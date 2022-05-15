import express, {Request, Response} from "express";
import * as fs from "fs";
import {replaceDataFile, updateWatchStatus} from "./update";

const app = express()
const port = 8000
const dataFilePath = '../data/data.json';

app.use(express.text({type: 'text/plain'}));
app.use(express.json({type: 'application/json'}));

app.use(express.static('frontend/dist'));

// GET environment settings
app.get('/env', async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'application/json');
  const siteInstance = process.env.SITE_INSTANCE;
  if (siteInstance) {
    res.send({ instance: siteInstance });
  } else {
    res.send({});
  }
});

// GET main data
app.get('/data', async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  const filename = `data-${timestamp}.json`;
  try {
    res.set('Content-Type', 'application/json')
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(await fs.promises.readFile(dataFilePath, 'utf-8'));
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
});

// PUT main data -- replaces old version
app.put('/data', async (req: Request, res: Response): Promise<void> => {
  try {
    await replaceDataFile(dataFilePath, req.body);
    res.status(200).send();
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
});

// PATCH main data -- modify most recently watched episode for a show (by index, 0-based)
app.patch('/data', async(req: Request, res: Response): Promise<void> => {
  const {show, seasonNum, episodesWatched} = req.body;
  try {
    await updateWatchStatus(dataFilePath, show, seasonNum, episodesWatched);
    res.status(200).send();
  } catch (e) {
    res.status(500).send(`Error: ${e}`);
  }
});

// Start server
app.listen(port, () => {
  console.log(`TV app listening on port ${port}`)
});
