import express, {Request, Response} from "express";
import mainPage from "./mainpage";
import exportData from "./export";
import {showDataFileForEditing, saveEditedDataFile} from "./edit";

const app = express()
const port = 8000
const dataFilePath = '../data/shows.csv';

app.use(express.urlencoded({extended: true}));
app.use(express.static('frontend'));

app.get('/', async (req: Request, res: Response): Promise<void> => {
  res.send(await mainPage(dataFilePath));
});

app.get('/export', async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'text/plain')
  res.send(await exportData(dataFilePath));
});

app.get('/edit', async (req: Request, res: Response): Promise<void> => {
  res.send(await showDataFileForEditing(dataFilePath));
});

app.post('/edit', async (req: Request, res: Response): Promise<void> => {
  saveEditedDataFile(req.body.text, dataFilePath);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`TV app listening on port ${port}`)
});
