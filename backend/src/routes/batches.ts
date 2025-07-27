import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Get all batches',
    data: [] 
  });
});

router.post('/', (req, res) => {
  res.json({ 
    message: 'Create new batch',
    data: req.body 
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: `Get batch ${id}`,
    data: { id } 
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: `Update batch ${id}`,
    data: { id, ...req.body } 
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    message: `Delete batch ${id}`,
    data: { id } 
  });
});

export default router;