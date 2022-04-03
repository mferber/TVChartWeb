import express, {Request, Response} from "express";
import mainPage from "./mainpage";
import exportData from "./export";
import editData from "./edit";

const app = express()
const port = 8000
const dataFilePath = '../data/shows.csv';


app.get('/', async (req: Request, res: Response): Promise<void> => {
  res.send(await mainPage(dataFilePath));
});

app.get('/export', async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'text/plain')
  res.send(await exportData(dataFilePath));
});

app.get('/edit', async (req: Request, res: Response): Promise<void> => {
  res.send(await editData(dataFilePath));
})

app.listen(port, () => {
  console.log(`TV app listening on port ${port}`)
});
