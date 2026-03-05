const express = require('express');
const { getAll, create, updateStatus } = require('../controllers/ticketsController');

const router = express.Router();

router.get('/',           getAll);
router.post('/',          create);
router.patch('/:id/status', updateStatus);

module.exports = router;
