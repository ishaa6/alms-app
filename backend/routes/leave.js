const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getPendingLeaves,
  handleLeaveDecision,
  getScheduledLeaves,
  getLeaveHistory,
  getHolidays,
  getLeaveLimits,
  getLeaveTypes,
  getUpcomingLeaves,
  cancelLeave,
  getMonthlyOverview
} = require('../controllers/leaveController');
const authenticate = require('../middleware/auth');

router.post('/leave', authenticate, applyLeave);
router.get('/leaves/pending', authenticate, getPendingLeaves);
router.post('/leave/:id/:decision', authenticate, handleLeaveDecision);
router.get('/leaves/scheduled', authenticate, getScheduledLeaves);
router.get('/leaves/history', authenticate, getLeaveHistory)
router.get('/leaves/holiday', authenticate, getHolidays)
router.get('/leaves/limits', authenticate, getLeaveLimits);
router.get('/leaves/types', authenticate, getLeaveTypes);
router.get('/leaves/upcoming', authenticate, getUpcomingLeaves);
router.post('/leaves/cancel', authenticate, cancelLeave);
router.get('/leaves/monthlyOverview', authenticate, getMonthlyOverview);

module.exports = router;
