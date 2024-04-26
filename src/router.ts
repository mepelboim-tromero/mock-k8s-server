import express from 'express';
import k8sController from './controllers/k8sController';
const router = express.Router();

// K8s routes
router.get('/clusters', k8sController.getClusters);
router.post('/admin/clusters', k8sController.createCluster);
router.patch('/clusters/:id', k8sController.updateCluster);
router.get('/nodes', k8sController.getNodes);
router.patch('/nodes/:id', k8sController.updateNode);
router.get('/pods', k8sController.getPods);
router.get('/pods/:id', k8sController.getPodById);
router.post('/pods', k8sController.createPod);
router.post('/pods/:id/end', k8sController.endPod);

export default router;
