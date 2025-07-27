import express from 'express';
import batchRoutes from './batches';

const router = express.Router();

router.use('/batches', batchRoutes);

router.get('/', (req, res) => {
  res.json({ 
    message: 'Batch Scheduler API',
    version: '1.0.0',
    endpoints: ['/batches']
  });
});

export default router;