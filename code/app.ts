import express, {Request, Response} from "express";
import * as storage from './storage';
import { Show, EpisodeDescriptor, StatusUpdate } from './types';

const app = express()
const port = 8000

app.use(express.text({type: 'text/plain'}));
app.use(express.json({type: 'application/json'}));

app.use(express.static('frontend/dist'));

const router_v0_1 = createRouter_v0_1();
app.use('/v0.1', router_v0_1);

// Start server
app.listen(port, () => {
  console.info(`TV app listening on port ${port}`)
});


// Set up router v0.1
function createRouter_v0_1() {
  const router = express.Router();

  // GET environment settings
  router.get('/env', async (req: Request, res: Response): Promise<void> => {
    res.set('Content-Type', 'application/json');
    const siteInstance = process.env.SITE_INSTANCE;
    if (siteInstance) {
      res.send({ instance: siteInstance });
    } else {
      res.send({});
    }
  });

  // GET all shows
  router.get('/shows', async (req: Request, res: Response): Promise<void> => {
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
  router.get('/shows/:id', async (req: Request, res: Response): Promise<void> => {
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

  // PATCH single show; returns patched show
  router.patch('/shows/:id', async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    try {
      const patched = await storage.patchShow(id, req.body);
      res.send(patched);
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
  router.put('/shows', async (req: Request, res: Response): Promise<void> => {
    try {
      const newShow: Partial<Show> = req.body;
      const show = await storage.storeShow(newShow);
      res.send(show);
    } catch (e) {
      console.error(e);
      res.status(500).send(`Error: ${e}`);
    }
  });

  // DELETE single show
  router.delete('/shows/:id', async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    try {
      storage.deleteShow(id);
      res.send();
    } catch (e) {
      console.error(e);
      res.status(500).send(`Error: ${e}`);
    }
  });

  // POST to show to update watched statuses
  // Body: document properties `watched` and `unwatched`, both optional.
  // Each, if present, contains an array of objects: { seasonIndex: N, episodeIndex: M }.
  router.post('/shows/:id/update-status', async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    try {
      const watched: EpisodeDescriptor[] | undefined = req.body.watched;
      const unwatched: EpisodeDescriptor[] | undefined = req.body.unwatched;
      const show = await storage.applyStatusUpdate(id, watched, unwatched);
      res.send(show);
    } catch (e) {
      console.error(e);
      res.status(500).send(`Error: ${e}`);
    }
  });

  // GET data file in its entirety for editing or backing up
  router.get('/data', async (req: Request, res: Response): Promise<void> => {
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
  router.put('/data', async (req: Request, res: Response): Promise<void> => {
    try {
      await storage.storeShows(req.body);
      res.status(200).send();
    } catch (e) {
      console.error(e);
      res.status(500).send(`Error: ${e}`);
    }
  });

  return router;
}
