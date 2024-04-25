import { Cluster, Node, Pod } from '../types';

let isInitialized = false;

let idForNodes = 1;
let idForClusters = 1;
let idForPods = 1;

export function increaseIdForNodes() {
  return idForNodes++;
}

const gpuTypes = [
  'NVIDIA A100 80GB',
  'NVIDIA H100',
  'NVIDIA L4',
  'NVIDIA A6000',
  'NVIDIA RTX A4000',
  'NVIDIA GeForce RTX 4090',
  'NVIDIA H800',
  'NVIDIA T4',
];

const regions = ['US', 'UK'];
const newPodStates = ['ready', 'ended'];

const osTypeNames = {
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  ubuntu: 'Ubuntu + CUDA',
  ubuntu_base: 'Ubuntu',
  jax: 'JAX',
  fsdp: 'Multi-GPU Ready',
  text_to_speech: 'Text to Speech',
  paddlepaddle: 'PaddlePaddle',
  hpc_scicomp: 'HPC/Sci-Comp',
  text_generation: 'No Code LLM',
  no_code_llm: 'No-Code LLM',
  mamba: 'Mamba',
  lightning: 'Lightning AI',
};

const osTemplates = Object.keys(osTypeNames);

export const fakeClusters: (Cluster | null)[] = [];
export const fakeNodes: (Node | null)[] = [];
export const fakePods: (Pod | null)[] = [];

const nodeExtraStuff = {
  cpu_frequency: '2799',
  cpu_name: 'AMD EPYC 7402P 24-Core Processor',
  disk_size: '1967',
  driver_version: '545.23.08',
  gpu_memory: '48',
  host: 'TromeroNative',
  host_ram: '230',
  host_swap: '7',
  network_download_speed: '0.6739883624906109',
  network_upload_speed: '0.10275971395448023',
  number_of_physical_cores: '80',
  os_name: 'Ubuntu 22.04.3 LTS',
  pcie_bandwidth: '0.5',
  pcie_generation: '3',
  pcie_lanes_per_gpu: '1',
  ports: '2222',
  total_number_of_cores: '80',
};

export const newPodObject = {
  id: 1,
  buyer_id: 1,
  node_id: 1,
  gpu_count: 1,
  currency: 'usd',
  state: 'starting',
  ready_at: null,
  ended_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  total_cost: 0,
  outstanding_cost: 0,
  last_payment_at: null,
  os_template: 'ubuntu',
  jupyter_token:
    'ea49f6cf40864e512990745ff51fa5bca5e9499b071aced559a678fed9329861',
  jupyter_url: 'https://None_8888.tromero.ai',
  ports: {
    jupyter: 8888,
    ssh: 2222,
  },
  ip_address: null,
};

function initializeClusters() {
  fakeClusters.push(
    ...Array.from({ length: 5 }, () => {
      const id = idForClusters++;
      const cluster: Cluster = {
        id,
        provider_id: id,
        ip_address: `192.168.1.${id}`,
        config_data: 'a very long string',
        availability: Math.random() > 0.2 ? 'available' : 'unavailable',
        accessibility: Math.random() > 0.2 ? 'accessible' : 'inaccessible',
        kyc_required: Math.random() > 0.8 ? true : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        region: regions[Math.floor(Math.random() * regions.length)],
        nodes: [],
      };
      const newNodes = createNodes({
        cluster,
        count: Math.ceil(Math.random() * 30),
      });
      cluster.nodes = newNodes;

      return cluster;
    })
  );
  isInitialized = true;
}

let initializationComplete = new Promise<void>((res, rej) => {
  try {
    if (!isInitialized) {
      initializeClusters();
    }
    res(void 0);
  } catch (error) {
    rej();
  }
});

async function wait(ms = 500) {
  await initializationComplete;
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function createNodes({ cluster, count }: { cluster: Cluster; count: number }) {
  const tempCluster = { ...cluster };
  delete tempCluster.nodes;

  return Array.from({ length: count }, () => {
    const id = idForNodes++;
    const gpu_count = Math.ceil(Math.random() * 8);
    const node: Node = {
      ...nodeExtraStuff,
      id,
      cluster_id: tempCluster.id,
      gpu_count,
      available_gpus: gpu_count,
      price_per_gpu: Math.ceil(Math.random() * 100),
      currency: 'usd',
      availability: Math.random() > 0.1 ? 'available' : 'unavailable',
      accessibility: Math.random() > 0.1 ? 'accessible' : 'inaccessible',
      gpu_type: gpuTypes[Math.floor(Math.random() * gpuTypes.length)],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cluster: tempCluster,
    };

    const newPods = createPods({
      node,
      count: Math.ceil(Math.random() * 3),
    });

    node.pods = newPods;

    fakeNodes.push(node);

    return node;
  });
}

function createPods({
  node,
  count,
}: {
  node: Omit<Node, 'pods'>;
  count: number;
}) {
  if (node.available_gpus === 0) {
    return [];
  }
  const arrayOfPods = Array.from({ length: count }, () => {
    const state = newPodStates[Math.floor(Math.random() * newPodStates.length)];
    const tempNode = { ...node };

    if (node.available_gpus === 0) {
      return null;
    }
    const gpu_count = Math.ceil(Math.random() * node.available_gpus);
    node.available_gpus -= gpu_count;

    const created_at = new Date(
      Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
    );
    let ready_at: Date | null = new Date(
      created_at.getTime() + Math.floor(Math.random() * 30 * 1000)
    );
    const ended_at =
      state === 'ended' || state === 'failed'
        ? new Date(ready_at.getTime() + Math.floor(Math.random() * 3600 * 1000))
        : null;

    const total_hours =
      state === 'failed' || state === 'ended'
        ? (ended_at!.getTime() - created_at.getTime()) / 1000 / 60 / 60
        : (new Date().getTime() - created_at.getTime()) / 1000 / 60 / 60;

    let total_cost = Math.round(
      tempNode.price_per_gpu * gpu_count * total_hours
    );

    if (state === 'failed') {
      total_cost = 0;
      ready_at = null;
    }

    const dates = [created_at];
    if (ready_at) dates.push(ready_at);
    if (ended_at) dates.push(ended_at);
    const updated_at = new Date(
      Math.max(...dates.map((date) => date.getTime()))
    );

    const pod = {
      ...newPodObject,
      id: idForPods++,
      buyer_id: Math.ceil(Math.random() * 20),
      node_id: tempNode.id,
      gpu_count,
      currency: 'usd',
      state,
      ready_at:
        state === 'ready' || state === 'ending' || state === 'ended'
          ? ready_at!.toISOString()
          : null,
      ended_at: ended_at?.toISOString(),
      created_at: created_at.toISOString(),
      updated_at: updated_at.toISOString(),
      total_cost,
      outstanding_cost: Math.random() * 500,
      last_payment_at: new Date().toISOString(),
      os_template: osTemplates[Math.ceil(Math.random() * osTemplates.length)],
      node: tempNode,
    };

    fakePods.push(pod);

    return pod;
  });

  return arrayOfPods.filter((pod) => pod !== null);
}
