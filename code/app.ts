import express, {Request, Response} from "express";
import * as storage from './storage';
import { Show } from './types';

const app = express()
const port = 8000

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

// GET all shows
app.get('/shows', async (req: Request, res: Response): Promise<void> => {
  try {
    const shows = await storage.fetchShows();
    res.set('Content-Type', 'application/json')
    res.send(shows);
  } catch (e) {
    console.error(e);
    res.status(500).send(`Error: ${e}`);
  }
});
 
// GET single show
app.get('/shows/:id', async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const show = await storage.fetchShow(id);
    res.set('Content-Type', 'application/json')
    res.send(show);
  } catch (e) {
    console.error(e);
    if (e instanceof storage.ShowNotFoundError) {
      res.status(404).send(`Show not found with id ${id}`);
    } else {
      res.status(500).send(`Error: ${e}`);
    }
  }
});

// PATCH single show
app.patch('/shows/:id', async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    await storage.patchShow(id, req.body);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    if (e instanceof storage.ShowNotFoundError) {
      res.status(404).send(`Show not found with id ${id}`);
    } else {
      res.status(500).send(`Error: ${e}`);
    }
  }
});

// PUT single show
app.put('/shows', async (req: Request, res: Response): Promise<void> => {
  try {
    const newShow: Partial<Show> = req.body;
    const show = await storage.storeShow(newShow);
    res.send(show);
  } catch (e) {
    console.error(e);
    res.status(500).send(`Error: ${e}`);
  }
});


// GET data file in its entirety for editing or backing up
app.get('/data', async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  const filename = `data-${timestamp}.json`;
  try {
    res.set('Content-Type', 'application/json')
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(await storage.fetchShows());
  } catch (e) {
    console.error(e);
    res.status(500).send(`Error: ${e}`);
  }
});

// PUT data file in its entirety, replacing old version, for restore from backup
app.put('/data', async (req: Request, res: Response): Promise<void> => {
  try {
    await storage.storeShows(req.body);
    res.status(200).send();
  } catch (e) {
    console.error(e);
    res.status(500).send(`Error: ${e}`);
  }
});

// Start server
app.listen(port, () => {
  console.info(`TV app listening on port ${port}`)
});
