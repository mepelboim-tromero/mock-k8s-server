import express, { Express, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { fakeClusters, fakeNodes, fakePods } from './data';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/nodes', (req: Request, res: Response) => {
  const osType = req.query.template;

  let nodesToReturn = fakeNodes.filter((n) => n && n.available_gpus > 0);
  if (osType === 'fsdp') {
    nodesToReturn = nodesToReturn.filter(
      (n) =>
        n && !n.gpu_type.includes('A4000') && !n.gpu_type.includes('RTX 4090')
    );
  }
  if (osType === 'text_generation') {
    nodesToReturn = nodesToReturn.filter(
      (n) => n && !n.gpu_type.includes('A6000')
    );
  }

  res.json({
    data: {
      os_template: osType,
      nodes: nodesToReturn,
      min_gpu_count: osType === 'fsdp' ? 2 : 1,
    },
  });
});

app.get('/clusters', (req: Request, res: Response) => {
  const providerId = Math.floor(Math.random() * 5);

  res.json({
    data: {
      clusters: fakeClusters.filter((c) => c && c.provider_id === providerId),
    },
  });
});

app.get('/pods', (req: Request, res: Response) => {
  const user_id = Math.floor(Math.random() * 5);
  res.json({
    data: { nodes: fakePods.filter((p) => p && p.buyer_id === user_id) },
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
