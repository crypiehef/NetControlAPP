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
  updateCheckInNotes,
  updateCheckInCommented
} = require('../controllers/netOperationController');
const auth = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { 
  validateNetOperation, 
  validateCheckIn, 
  validateMongoId, 
  validateReportQuery 
} = require('../middleware/validation');

router.post('/', apiLimiter, auth, validateNetOperation, createNetOperation);
router.post('/schedule', apiLimiter, auth, validateNetOperation, scheduleNetOperation);
router.get('/', apiLimiter, auth, validateReportQuery, getNetOperations);
router.get('/lookup/:callsign', apiLimiter, auth, lookupCallsign);
router.get('/:id', apiLimiter, auth, validateMongoId, getNetOperation);
router.put('/:id', apiLimiter, auth, validateMongoId, validateNetOperation, updateNetOperation);
router.put('/:id/complete', apiLimiter, auth, validateMongoId, completeNetOperation);
router.put('/:id/start', apiLimiter, auth, validateMongoId, startScheduledNet);
router.put('/:id/notes', apiLimiter, auth, validateMongoId, updateNetNotes);
router.put('/:id/checkins/:checkinId/notes', apiLimiter, auth, validateMongoId, updateCheckInNotes);
router.put('/:id/checkins/:checkinId/commented', apiLimiter, auth, validateMongoId, updateCheckInCommented);
router.post('/:id/checkins', apiLimiter, auth, validateMongoId, validateCheckIn, addCheckIn);
router.delete('/:id/checkins/:checkinId', apiLimiter, auth, validateMongoId, deleteCheckIn);
router.delete('/:id', apiLimiter, auth, validateMongoId, deleteNetOperation);
router.get('/:id/pdf', apiLimiter, auth, validateMongoId, exportToPDF);

module.exports = router;

