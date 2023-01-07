# TVChartWeb

A silly project, based on an [equally silly project](https://github.com/mferber/TVChart), to keep track of the TV we're watching. The original version generated a PDF to be filled in, but periodically reprinting the PDF was a pain. This project reimplements it as a webapp that can be accessed from all our devices and doesn't need to be printed out ever.

## Development notes

During development, the app runs off a Docker image `tv-chart-dev`. This image doesn't contain the app's code and data: they're mapped in from the project's working directories (`./code` and `./data`).

To start the dev environment:

1. With Docker running, run `./run.dev` to start the app dev environment. It starts the app in a container, mapping the app's source code directly from the working directory (`./code`), and using `nodemon` so the app is rebuilt and restarted when the code changes. It tails the app's output log.
2. To also enable live updating for front-end changes (to files in `./code/frontend`), in another terminal window, go to `./code/frontend` and run `npx webpack --watch`.

The Docker image rarely needs to change, since it doesn't contain the app's code and data. In the rare case when it needs to be updated, run `dockerize.dev` to rebuild it.

To stop the dev app, run `./stop.dev`.

## Releasing

To release an update to production:

1. Rebuild the production Docker image (`taskmaster.local:5000/tv-chart`), run `./dockerize.prod`.
2. `docker push taskmaster.local:5000/tv-chart` to push it to the repository. (At this writing, this is a locally hosted private repository. Substitute the hostname and port of another repository if necessary.)
3. Make sure `run.prod` and `docker-compose.prod.yml` have both been copied to the production host.
4. On the production host, pull the image, stop the running app, and run `run.prod`.