import { Request, Response } from 'express';
import { fakeClusters, fakeNodes, fakePods } from '../data';

const getClusters = (req: Request, res: Response) => {
  const providerId = Math.floor(Math.random() * 5);

  res.json({
    data: {
      clusters: fakeClusters.filter((c) => c && c.provider_id === providerId),
    },
  });
};

const getNodes = (req: Request, res: Response) => {
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
};

const getPods = (req: Request, res: Response) => {
  const user_id = Math.floor(Math.random() * 5);
  res.json({
    data: { nodes: fakePods.filter((p) => p && p.buyer_id === user_id) },
  });
};

export default {
  getClusters,
  getNodes,
  getPods,
};
