const express = require('express');
const router = express.Router();
const { 
    clockIn, 
    clockOut, 
    getLogs, 
    getWorkingDays,
    getLateClockIns,
    getMonthlyLeaves,
    getShiftTypes,
    makeEntry,
    getAttendanceSummary,
    getAttendanceByDate,
    getStatus,
    getManualClockIns,
    approveManualClockIn
 } = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');

router.post('/clock-in', authenticate, clockIn);
router.get('/manual/clockIn', authenticate, getManualClockIns);
router.post('/clock-in/:id/:status', authenticate, approveManualClockIn);
router.post('/clock-out', authenticate, clockOut);
router.get('/logs', authenticate, getLogs);
router.get('/working-days/:companyId', authenticate, getWorkingDays);
router.get('/late-clock-ins', authenticate, getLateClockIns);
router.get('/monthly-leaves', authenticate, getMonthlyLeaves);
router.get('/shift/types', authenticate, getShiftTypes);
router.post('/entry', authenticate, makeEntry);
router.get('/annualsummary', authenticate, getAttendanceSummary);
router.get('/attendance/:date', authenticate, getAttendanceByDate);
router.get('/clocked-status', authenticate, getStatus);

module.exports = router;
