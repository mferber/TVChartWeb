import express, {Request, Response} from "express";
import * as fs from "fs";
import {saveEditedDataFile} from "./edit";

const app = express()
const port = 8000
const dataFilePath = '../data/shows.csv';

app.use(express.urlencoded({extended: true}));
app.use(express.static('frontend/dist'));

app.get('/data', async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'text/plain')
  res.send(await fs.promises.readFile(dataFilePath, 'utf-8'));
});

app.post('/edit', async (req: Request, res: Response): Promise<void> => {
  saveEditedDataFile(req.body.text, dataFilePath);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`TV app listening on port ${port}`)
});
