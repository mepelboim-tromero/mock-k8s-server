import express from 'express';
import k8sController from './controllers/k8sController';
const router = express.Router();

// K8s routes
router.get('/clusters', k8sController.getClusters);
router.get('/nodes', k8sController.getNodes);
router.get('/pods', k8sController.getPods);

export default router;
