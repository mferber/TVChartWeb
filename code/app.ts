import express, {Request, Response} from "express";
import * as fs from "fs";
import {saveEditedDataFile} from "./edit";

const app = express()
const port = 8000
const dataFilePath = '../data/shows.csv';

app.use(express.text({type: 'text/plain'}));

app.use(express.static('frontend/dist'));

// GET main data
app.get('/data', async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'text/plain')
  res.send(await fs.promises.readFile(dataFilePath, 'utf-8'));
});

// PUT main data -- replaces old version
app.put('/data', async (req: Request, res: Response): Promise<void> => {
  await saveEditedDataFile(req.body, dataFilePath);
  res.status(200).send();
});

// PATCH main data -- modify most recently watched episode for a show
app.patch('/data', async(req: Request, res: Response): Promise<void> => {

});

// Start server
app.listen(port, () => {
  console.log(`TV app listening on port ${port}`)
});
