import { Request, Response } from 'express';
import {
  fakeClusters,
  fakeNodes,
  fakePods,
  increaseIdForNodes,
  newPodObject,
} from '../mockData/k8sData';

const getClusters = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }

  const providerId = Math.floor(Math.random() * 5);

  res.json({
    clusters: fakeClusters.filter((c) => c && c.provider_id === providerId),
  });
};

const getNodes = (req: Request, res: Response) => {
  const osType = req.query.template;

  if (!osType) {
    res.status(400).json({ error: { message: 'template is required' } });
    return;
  }

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
    os_template: osType,
    nodes: nodesToReturn,
    min_gpu_count: osType === 'fsdp' ? 2 : 1,
  });
};

const getPods = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const user_id =
    req.headers.authorization &&
    parseInt(req.headers?.authorization?.split(' ')[1]);
  if (!user_id) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }

  const podsToReturn = fakePods.filter((p) => p && p.buyer_id === user_id);
  res.json({ pods: fakePods.filter((p) => p && p.buyer_id === user_id) });
};

const getPodById = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const podId = parseInt(req.params.id);
  const pod = fakePods.find((p) => p && p.id == podId);
  if (!pod) {
    res.status(404).json({ error: { message: 'Pod not found' } });
    return;
  }
  res.json({ pod });
};

const createPod = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const { node_id, gpu_count, os_template } = req.body;
  const user_id =
    req.headers.authorization &&
    parseInt(req.headers?.authorization?.split(' ')[1]);

  if (!user_id) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  if (!gpu_count || gpu_count < 1) {
    res
      .status(400)
      .json({ error: { message: 'gpu_count must be at least 1' } });
    return;
  }
  if (!os_template || os_template === '') {
    res.status(400).json({ error: { message: 'os_template is required' } });
    return;
  }
  const node = fakeNodes.find((n) => n && n.id === node_id);
  if (!node) {
    res.status(400).json({ error: { message: 'node_id is invalid' } });
    return;
  }

  const tempNode = { ...node };
  delete tempNode.pods;
  const pod = {
    ...newPodObject,
    gpu_count,
    os_template,
    id: increaseIdForNodes(),
    buyer_id: user_id,
    state: 'starting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    node: tempNode,
  };
  fakePods.push(pod);

  setTimeout(() => {
    const foundPod = fakePods.find((p) => p && p.id === pod.id);
    console.log('Pod started:', foundPod);
    if (foundPod) {
      foundPod.state = 'ready';
      foundPod.ready_at = new Date().toISOString();
      foundPod.updated_at = new Date().toISOString();
    }
  }, Math.floor(Math.random() * 10000) + 10000);

  res
    .status(201)
    .json({ pod, status: 'success', message: 'Reservation starting' });
};

const endPod = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const podId = parseInt(req.params.id);
  const pod = fakePods.find((p) => p && p.id == podId);
  if (!pod) {
    res.status(404).json({ error: { message: 'Pod not found' } });
    return;
  }
  if (pod.state === 'ending') {
    res.status(400).json({ error: { message: 'Pod is already ending' } });
    return;
  }
  pod.state = 'ending';
  pod.updated_at = new Date().toISOString();

  setTimeout(() => {
    const foundPod = fakePods.find((p) => p && p.id === pod.id);
    if (foundPod) {
      foundPod.state = 'ended';
      foundPod.ended_at = new Date().toISOString();
      foundPod.updated_at = new Date().toISOString();
    }
    console.log('Pod ended:', foundPod);
  }, Math.floor(Math.random() * 10000) + 5000);

  res.json({ status: 'success', message: 'Reservation ending' });
};

const updateCluster = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const clusterId = parseInt(req.params.id);
  const cluster = fakeClusters.find((c) => c && c.id == clusterId);
  if (!cluster) {
    res.status(404).json({ error: { message: 'Cluster not found' } });
    return;
  }
  const { availability } = req.body;
  if (!availability || availability === '') {
    res.status(400).json({ error: { message: 'availability is required' } });
    return;
  }
  cluster.availability = availability;
  res.json({ status: 'success', message: 'Cluster updated' });
};

const updateNode = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }
  const nodeId = parseInt(req.params.id);
  const node = fakeNodes.find((n) => n && n.id == nodeId);
  if (!node) {
    res.status(404).json({ error: { message: 'Node not found' } });
    return;
  }
  const { price_per_gpu, availability } = req.body;
  if (price_per_gpu && price_per_gpu < 0) {
    res
      .status(400)
      .json({ error: { message: 'price_per_gpu must be at least 0' } });
    return;
  }
  if (availability && availability === '') {
    res.status(400).json({ error: { message: 'availability is required' } });
    return;
  }
  if (price_per_gpu) {
    node.price_per_gpu = price_per_gpu;
  }
  if (availability) {
    node.availability = availability;
  }
  res.json({ status: 'success', message: 'Node updated' });
};

const createCluster = (req: Request, res: Response) => {
  const isLogged = req.headers['is-logged-in'] === 'true';
  const data = req.body;

  if (!isLogged) {
    res.status(401).json({ error: { message: 'Unauthorized' } });
    return;
  }

  const newCluster = {
    id: fakeClusters.length + 1,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  fakeClusters.push(newCluster);
  res.status(201).json({
    cluster: newCluster,
    status: 'success',
    message: 'Cluster created successfully',
  });
};

export default {
  getClusters,
  createCluster,
  updateCluster,
  getNodes,
  updateNode,
  getPods,
  getPodById,
  createPod,
  endPod,
};
