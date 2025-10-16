const { getPool } = require('../config/db');
const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');

dayjs.extend(isSameOrBefore);

exports.applyLeave = async (req, res) => {
  const pool = getPool();
  const { leaveType, from_date, to_date, reason } = req.body;
  const userId = req.user.id;
  const companyId = req.user.company_id;

  try {
    const fromDate = dayjs(from_date).format('YYYY-MM-DD');
    const toDate = dayjs(to_date).format('YYYY-MM-DD');
    console.log('Leave requested for:', from_date, 'to', to_date);
    console.log('Parsed dates:', fromDate, '→', toDate);

// STEP 1: Fetch holidays within the range
const holidayRes = await pool.query(
  `SELECT name, from_date, to_date, leave_type 
   FROM holidays 
   WHERE $1::date <= to_date::date AND $2::date >= from_date::date`,
  [fromDate, toDate]
);

// STEP 2: Classify holidays
const optionalHolidayDates = new Set();
const mandatoryHolidayDates = new Set();

for (const row of holidayRes.rows) {
  const curr = new Date(row.from_date);
  const end = new Date(row.to_date);

  while (curr <= end) {
    const isoDate = curr.toISOString().split('T')[0]; // Always "YYYY-MM-DD"
    if (row.leave_type.toLowerCase() === 'optional') {
      optionalHolidayDates.add(isoDate);
    } else {
      mandatoryHolidayDates.add(isoDate);
    }
    curr.setDate(curr.getDate() + 1);
  }
}

console.log("📅 Holidays Returned from DB:");
for (const row of holidayRes.rows) {
  console.log(`${row.name}: ${row.from_date.toISOString().split('T')[0]} to ${row.to_date.toISOString().split('T')[0]}, Type: ${row.leave_type}`);
}

console.log("Mandatory Holidays:", Array.from(mandatoryHolidayDates));
console.log("Optional Holidays:", Array.from(optionalHolidayDates));

// STEP 3: Get weekends
const weekendRes = await pool.query(
  `SELECT weekend_days FROM weekends WHERE company_id = $1`,
  [companyId]
);
const weekendDays = weekendRes.rowCount > 0
  ? weekendRes.rows[0].weekend_days.map(day => day.trim())
  : [];

console.log("Weekend Days:", weekendDays);

// STEP 4: Filter working days
const workingDays = [];
let currDate = dayjs(fromDate);
const endDate = dayjs(toDate);

while (currDate.isSameOrBefore(endDate)) {
  const isoDate = currDate.format('YYYY-MM-DD');
  const dayName = currDate.format('dddd'); // e.g., 'Friday'

  const isWeekend = weekendDays.includes(dayName);
  const isHoliday = mandatoryHolidayDates.has(isoDate);

  if (!isWeekend && !isHoliday) {
    workingDays.push(isoDate);
  } else {
    console.log(`Excluded: ${isoDate} (${dayName}) - ${isWeekend ? 'Weekend' : ''} ${isHoliday ? 'Holiday' : ''}`);
  }

  currDate = currDate.add(1, 'day');
}

if (workingDays.length === 0) {
  return res.status(400).json({
    error: 'Leave cannot be applied only for holidays or weekends'
  });
}

// STEP 5: If optional leave, validate only on optional holidays
if (leaveType.toLowerCase() === 'optional') {
  const allOptional = workingDays.every(date => optionalHolidayDates.has(date));
  if (!allOptional) {
    return res.status(400).json({
      error: 'Optional leave can only be applied on optional holidays',
      allowed_optional_dates: Array.from(optionalHolidayDates)
    });
  }
}

const actualLeaveDays = workingDays.length;

  

    //Check for overlap
    const overlapCheck = await pool.query(
      `SELECT * FROM leave_requests 
      WHERE user_id = $1 
      AND $2::date <= to_date AND $3::date >= from_date`,
      [userId, fromDate, toDate]
    );

    if (overlapCheck.rowCount > 0) {
      return res.status(400).json({ error: 'Leave already applied for this duration' });
    }


    //Check leave limits
    const limitRes = await pool.query(
      `SELECT holidays_taken, allowed_holidays, optional_holidays_taken, allowed_optional_holidays
       FROM leave_limits
       WHERE employee_id = $1`,
      [userId]
    );

    if (limitRes.rowCount === 0) {
      return res.status(400).json({ error: 'Leave limits not set for user' });
    }

    const {
      holidays_taken,
      allowed_holidays,
      optional_holidays_taken,
      allowed_optional_holidays,
    } = limitRes.rows[0];

    const type = leaveType.toLowerCase();
    if (
      (type === 'optional' &&
        optional_holidays_taken + actualLeaveDays > allowed_optional_holidays) ||
      (type !== 'optional' && holidays_taken + actualLeaveDays > allowed_holidays)
    ) {
      return res.status(400).json({
        error: 'Leave exceeds allowed quota',
        holidays_left: allowed_holidays-holidays_taken,
        optional_holidays_left: allowed_optional_holidays-optional_holidays_taken
      });
    }

    //Apply leave
    await pool.query(
      `INSERT INTO leave_requests (user_id, from_date, to_date, reason, leave_type, num_days, company_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, from_date, to_date, reason, leaveType, actualLeaveDays, companyId]
    );

    const updatedOptionalHolidaysLeft = allowed_optional_holidays - optional_holidays_taken;
    const updatedRegularHolidaysLeft = allowed_holidays - holidays_taken;

    if (type === 'optional') {
      res.status(200).json({
        message: 'Leave applied successfully',
        optional_holidays_left: updatedOptionalHolidaysLeft - actualLeaveDays,
        holidays_left: updatedRegularHolidaysLeft
      });
    } else {
      res.status(200).json({
        message: 'Leave applied successfully',
        holidays_left: updatedRegularHolidaysLeft - actualLeaveDays,
        optional_holidays_left: updatedOptionalHolidaysLeft
      });
    }
  } catch (err) {
    console.error('Leave Application Error:', err);
    res.status(500).json({ error: 'Failed to apply leave' });
  }
};

exports.getPendingLeaves = async (req, res) => {
  const pool = getPool(); 
  const managerId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT L.*, U.name as user_name 
       FROM leave_requests L
       JOIN users U ON L.user_id = U.id
       WHERE U.manager_id = $1 AND L.status = 'Pending'
       ORDER BY L.applied_at DESC`,
      [managerId] // Pass manager ID as parameter
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching pending leaves' });
  }
};

exports.handleLeaveDecision = async (req, res) => {
  const pool = getPool(); 
  const { id, decision } = req.params;
  console.log("Leave ID: ", id);
  if (!['Approved', 'Rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  try {
    await pool.query(
      'UPDATE leave_requests SET status = $1 WHERE id = $2',
      [decision, id]
    );
    console.log("DB UPDATED");
    res.json({ message: `Leave ${decision}d` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update leave status' });
  }
};

exports.getScheduledLeaves = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user?.id; 
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leave_requests 
       WHERE user_id = $1 
       AND from_date >= CURRENT_DATE
       ORDER BY from_date ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scheduled leaves' });
  }
};

exports.getLeaveHistory = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user?.id; 
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM leave_requests 
       WHERE user_id = $1 
       AND from_date < CURRENT_DATE
       ORDER BY from_date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scheduled leaves' });
  }
};

exports.getHolidays = async (req, res) => {
  const pool = getPool(); 
  try {
    const result = await pool.query(
      `SELECT * FROM holidays 
      WHERE from_date>=CURRENT_DATE
      ORDER BY from_date`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching scheduled leaves' });
  }
};

exports.getLeaveLimits = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    console.log("Fetching leave limits for userId:", userId);

    const result = await pool.query(
      `SELECT 
         allowed_holidays,
         allowed_optional_holidays,
         optional_holidays_taken,
         holidays_taken
       FROM leave_limits 
       WHERE employee_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No leave limit set for this user' });
    }

    const {
      allowed_holidays,
      allowed_optional_holidays,
      optional_holidays_taken,
      holidays_taken
    } = result.rows[0];

    console.log(allowed_holidays, allowed_optional_holidays, optional_holidays_taken, holidays_taken)

    let leave_balance = null;

    leave_balance =
        (allowed_holidays || 0) +
        (allowed_optional_holidays || 0) -
        (optional_holidays_taken || 0) -
        (holidays_taken || 0);

    if(leave_balance<0){leave_balance=0}

    res.json({
      allowedHolidays: allowed_holidays || 0,
      optionalLimit: allowed_optional_holidays || 0,
      optionalTaken: optional_holidays_taken || 0,
      holidaysTaken: holidays_taken || 0,
      leaveBalance: leave_balance
    });

  } catch (err) {
    console.error("Error fetching leave limits:", err);
    res.status(500).json({ error: 'Error fetching leave limits' });
  }
};

exports.getLeaveTypes = async (req, res) => {
  const companyId = req.user.company_id;
  const userId = req.user.id; 
  const pool = getPool(); 
  try {
    const result = await pool.query(`SELECT label, value FROM leave_types where company_id= $1`, [companyId]);
    const leaveBalanceRes = await pool.query(`SELECT optional_holidays_taken, holidays_taken, allowed_holidays, allowed_optional_holidays FROM leave_limits WHERE employee_id = $1 and company_id = $2`, [userId, companyId]);
    
    const leaveBalance = leaveBalanceRes.rows[0] || {
      optional_holidays_taken: 0,
      holidays_taken: 0,
      allowed_holidays: 0,
      allowed_optional_holidays: 0,
    };

    const leaveTypesWithBalance = result.rows.map((type) => {
      let balance = 0;
      let label = type.label;
      if (type.value === 'optional') {
        balance = leaveBalance.allowed_optional_holidays - leaveBalance.optional_holidays_taken;
        if (balance<0){balance=0}
        label = `${label} (${balance} left)`;
      } else if (type.value === 'unpaid') {
        label = `${label}`;
      } else {
        balance = leaveBalance.allowed_holidays - leaveBalance.holidays_taken;
        if (balance<0){balance=0}
        label = `${label} (${balance} left)`;
      }

      return {
        ...type,
        label: `${label}`
      };
    });

    res.json(leaveTypesWithBalance);
  } catch (err) {
    console.error('Error fetching leave types:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUpcomingLeaves = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user.id; // if required per user
  const companyId = req.user.company_id;

  try {
    const result = await pool.query(`
      (
        SELECT from_date AS date, reason AS title
        FROM leave_requests
        WHERE status = 'Approved' 
          AND from_date > CURRENT_DATE 
          AND user_id = $1 AND company_id = $2
      )
      UNION
      (
        SELECT from_date, name AS title
        FROM holidays
        WHERE from_date > CURRENT_DATE AND company_id = $2
      )
      ORDER BY date
      LIMIT 2
    `, [userId, companyId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching upcoming leaves:", err);
    res.status(500).json({ error: 'Failed to fetch upcoming leaves' });
  }
};

exports.cancelLeave = async (req, res) => {
  const pool = getPool(); 
  const { id, leave_type, status } = req.body;

  try{
    if(status==='Approved'){
      const leaveResult = await pool.query(
        'SELECT user_id, from_date, to_date FROM leave_requests WHERE id = $1',
        [id]
      );

      if (leaveResult.rowCount === 0) {
        return res.status(404).json({ error: 'No such leave found' });
      }

      const { user_id, from_date, to_date } = leaveResult.rows[0];

      const fromDate = new Date(from_date);
      const toDate = new Date(to_date);
      const dayCount = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

      const column = leave_type === 'Optional' ? 'optional_holidays_taken' : 'holidays_taken';
      await pool.query(
        `UPDATE leave_limits 
        SET ${column} = GREATEST(${column}-$1,0)
        WHERE employee_id = $2`,
      [dayCount, user_id]);
    }
    await pool.query('DELETE FROM leave_requests WHERE id = $1', [id]);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel leave' });
  }
};

exports.getMonthlyOverview = async (req, res) => {
  const pool = getPool(); 
  try {
    const userId    = req.user.id;
    const companyId = req.user.company_id;

    console.log("Fetching monthly overview");

    // Parse & validate month/year
    const today = new Date();
    let month = parseInt(req.query.month, 10);
    let year  = parseInt(req.query.year, 10);
    if (!(month >= 1 && month <= 12)) month = today.getMonth() + 1;
    if (!(year >= 1900 && year <= 3000)) year = today.getFullYear();

    // Format date range
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayDate = new Date(year, month, 0);
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
    const monthEnd = new Date(lastDay);
    const end = today < monthEnd ? today : monthEnd;

    console.log('Overview for', companyId, 'from', firstDay, 'to', lastDay);

    // --- Fetch holidays
    const holidaysQ = await pool.query(
      `SELECT to_char(from_date, 'YYYY-MM-DD') AS from_date,
              to_char(to_date,   'YYYY-MM-DD') AS to_date,
              name
         FROM holidays
        WHERE (company_id = $1 OR company_id IS NULL)
          AND from_date <= $3 AND to_date >= $2
     ORDER BY from_date`,
      [companyId, firstDay, lastDay]
    );

    const holidayDates = new Set();
    holidaysQ.rows.forEach(h => {
      const from = new Date(h.from_date);
      const to = new Date(h.to_date);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        holidayDates.add(d.toISOString().split('T')[0]);
      }
    });

    // --- Fetch attendance
    const attendanceQ = await pool.query(
      `SELECT to_char(date, 'YYYY-MM-DD') AS date
         FROM attendance
        WHERE company_id = $1 AND user_id = $2
          AND date BETWEEN $3 AND $4`,
      [companyId, userId, firstDay, lastDay]
    );
    const attendedDates = new Set(attendanceQ.rows.map(r => r.date));

    // --- Fetch leaves (filter only approved)
    console.log('Querying leave_requests for:', { companyId, userId, firstDay, lastDay });
    const leavesQ = await pool.query(
      `SELECT to_char(from_date, 'YYYY-MM-DD') AS from_date,
              to_char(to_date,   'YYYY-MM-DD') AS to_date,
              status
         FROM leave_requests
        WHERE company_id = $1 AND user_id = $2
          AND (
            from_date BETWEEN $3 AND $4 OR
            to_date BETWEEN $3 AND $4
          )
     ORDER BY applied_at DESC`,
      [companyId, userId, firstDay, lastDay]
    );

    console.log('Leave results:', leavesQ.rows);

    const approvedLeaves = [];
    const leaveDates = new Set();

    for (const l of leavesQ.rows) {
      if (l.status.toLowerCase() !== 'approved') continue;

      const from = new Date(l.from_date);
      const to = new Date(l.to_date);
      let valid = false;

      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split('T')[0];
        const isWeekend = d.getDay() === 0 || d.getDay() === 6;

        if (!holidayDates.has(ds) && !isWeekend) {
          leaveDates.add(ds);
          valid = true;
        }
      }

      if (valid) {
        approvedLeaves.push({
          from_date: l.from_date,
          to_date: l.to_date,
        });
      }
    }


    // --- Build notClockedIn (exclude holidays, weekends, approved leaves, attended days)
    const notClockedIn = [];
    const start = new Date(firstDay);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const ds = `${yyyy}-${mm}-${dd}`;

      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      if (
        !attendedDates.has(ds) &&
        !holidayDates.has(ds) &&
        !leaveDates.has(ds) &&
        !isWeekend
      ) {
        notClockedIn.push(ds);
      }
    }

    return res.json({
      holidays: holidaysQ.rows,
      notClockedIn,
      leavesApproved: approvedLeaves,
    });

  } catch (err) {
    console.error('getMonthlyOverview failed:', err);
    return res.status(500).json({ error: 'Failed to load monthly overview' });
  }
};
