const express = require('express');
const router = express.Router();
const {
  createNetOperation,
  getNetOperations,
  getNetOperation,
  updateNetOperation,
  addCheckIn,
  lookupCallsign,
  completeNetOperation,
  exportToPDF,
  deleteCheckIn,
  deleteNetOperation,
  scheduleNetOperation,
  startScheduledNet,
  updateNetNotes,
  updateCheckInNotes
} = require('../controllers/netOperationController');
const auth = require('../middleware/auth');

router.post('/', auth, createNetOperation);
router.post('/schedule', auth, scheduleNetOperation);
router.get('/', auth, getNetOperations);
router.get('/lookup/:callsign', auth, lookupCallsign);
router.get('/:id', auth, getNetOperation);
router.put('/:id', auth, updateNetOperation);
router.put('/:id/complete', auth, completeNetOperation);
router.put('/:id/start', auth, startScheduledNet);
router.put('/:id/notes', auth, updateNetNotes);
router.put('/:id/checkins/:checkinId/notes', auth, updateCheckInNotes);
router.post('/:id/checkins', auth, addCheckIn);
router.delete('/:id/checkins/:checkinId', auth, deleteCheckIn);
router.delete('/:id', auth, deleteNetOperation);
router.get('/:id/pdf', auth, exportToPDF);

module.exports = router;

