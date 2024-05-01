import dotenv from 'dotenv';
dotenv.config();
import express, { Express } from 'express';
import router from './router';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import repl from 'repl';
import helmet from 'helmet';
import csurf from 'csurf';
import { fakeClusters, fakeNodes, fakePods } from './mockData/k8sData';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(csurf({ cookie: true }));

app.use('/', router);

app.listen(port, () => {
  console.log(`[server]: Server is running at port: ${port}`);

  const replServer = repl.start({
    prompt: '>',
    useColors: true,
  });

  replServer.context.app = app;
  replServer.context.clusters = fakeClusters;
  replServer.context.nodes = fakeNodes;
  replServer.context.pods = fakePods;
  replServer.context.router = router;
});
