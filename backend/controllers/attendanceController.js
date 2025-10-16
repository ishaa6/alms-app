const { getPool } = require('../config/db');
const {fetchSecrets} = require('../vault/vault-client');

exports.clockIn = async (req, res) => {
  const pool = getPool();
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const companyId = req.user.company_id; 
  const { latitude, longitude, ip } = req.body;

  const coordinates = `${latitude}, ${longitude}`

  let location='Unknown';

  try {
    const secrets = await fetchSecrets();
    const geoRes = await fetch(`https://us1.locationiq.com/v1/reverse?key=${secrets.API_MAPS}&lat=${latitude}&lon=${longitude}&format=json`);
    const data = await geoRes.json();

    if (data && data.address) {
      const addr = data.address;
      const parts = [
        addr.name,
        addr.road,
        addr.suburb,
        addr.neighbourhood,
        addr.city || addr.town,
        addr.state_district,
        addr.state,
        addr.postcode,
        addr.country
      ].filter(Boolean);
      location = parts.join(', ');
    }
  } catch (err) {
    console.error('Reverse geocode failed:', err);
  }

  console.log("Coordinates: ", latitude, ',', longitude);
  console.log("Location: ", location);

  try {
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length > 0 && existing.rows[0].clock_in) {
      await pool.query(`UPDATE attendance SET status = 'Clocked In' WHERE user_id = $1 AND date = $2`,
      [userId, today]
    );
      return res.status(400).json({ error: 'Already clocked in today' });
    }

    await pool.query(
      `INSERT INTO attendance (user_id, date, clock_in, company_id, status, ip_address, location, location_coordinates) 
      VALUES ($1, $2, NOW(), $3, 'Clocked In', $4, $5, $6) ON CONFLICT (user_id, date) DO UPDATE SET clock_in = NOW()`,
      [userId, today, companyId, ip, location, coordinates]
    );

    res.json({ message: 'Clocked in' });
  } catch (err) {
    res.status(500).json({ error: 'Error clocking in' });
  }
};

exports.clockOut = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `UPDATE attendance SET clock_out = NOW(), status = 'Clocked Out' WHERE user_id = $1 AND date = $2 RETURNING *`,
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Clock-in required before clock-out' });
    }

    res.json({ message: 'Clocked out' });
  } catch (err) {
    res.status(500).json({ error: 'Error clocking out' });
  }
};

exports.getLogs = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT date, clock_in, clock_out FROM attendance WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );

    const logs = result.rows.map((r) => ({
      message: `Date: ${r.date}, Clock In: ${r.clock_in || '—'}, Clock Out: ${r.clock_out || '—'}`,
    }));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

exports.getWorkingDays = async (req, res) => {
  const pool = getPool(); 

  const companyId = req.user.company_id; 
  
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required' });
  }

  try {
    const result = await pool.query(
      `SELECT total_working_days FROM working_days_summary
       WHERE company_id = $1 AND month = $2 AND year = $3`,
      [companyId, month, year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No working days data found' });
    }

    const workingDays = result.rows[0].total_working_days;
    console.log('Working Days:', workingDays);
    res.json(workingDays);

  } catch (err) {
    console.error('Error fetching working days:', err);
    res.status(500).json({ error: 'Failed to fetch working days' });
  }
};

exports.getLateClockIns = async (req, res) => {
  const pool = getPool(); 
  const userId = req.user.id;
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS late_clockins
       FROM attendance a
       JOIN companies c ON a.company_id = c.id
       WHERE a.user_id = $1
         AND EXTRACT(MONTH FROM a.date) = $2
         AND EXTRACT(YEAR FROM a.date) = $3
         AND a.clock_in::time > c.expected_clock_in`,
      [userId, month, year]
    );
    console.log('Late Clock-Ins Result:', result.rows);
    if (result.rows.length === 0) {
      res.json(0);
    }
    const lateClockIns = parseInt(result.rows[0].late_clockins, 10);
    res.json(lateClockIns);
  } catch (err) {
    console.error('Error fetching late clock-ins:', err);
    res.status(500).json({ error: 'Failed to fetch late clock-ins' });
  }
};

exports.getMonthlyLeaves = async(req, res) =>{ 
  const pool = getPool(); 
  userId = req.user.id;
  companyId = req.user.company_id;

  try{
    const leaveTakenResult = await pool.query(
      `SELECT COUNT(*) AS leave_taken
       FROM leave_requests
       WHERE status = 'Approved'
         AND company_id = $1 
         AND user_id = $2
         AND EXTRACT(YEAR FROM from_date) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND EXTRACT(MONTH FROM from_date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [companyId, userId]
    );

    const leaveTaken = parseInt(leaveTakenResult.rows[0].leave_taken) || 0;
    res.json(leaveTaken)
  } catch(err){
    console.error('Error fetching monthly leaves taken:', err);
    res.status(500).json({ error: 'Failed to fetch monttly leaves' });
  }
}

exports.getShiftTypes = async (req, res) => {
  const pool = getPool(); 
  console.log("Fetching shift types...");
  try {
    const result = await pool.query('SELECT label, value FROM shift_types');
    console.log('Shift Types: ', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching shift types:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.makeEntry = async (req, res) => {
  const pool = getPool(); 
  const { shiftType, date, reason, inTime, outTime, location, ip, coordinates } = req.body;
  const userId = req.user.id;
  const companyId = req.user.company_id;

  try {
    await pool.query(
      `INSERT INTO manual_entry (user_id, company_id, shift_type, date, reason, clock_in, clock_out, location, ip, coordinates)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, companyId, shiftType, date, reason, inTime, outTime, location, ip, coordinates]
    );
    res.json({ message: 'Attendance entry created' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to make attendance entry' });
  }
};



// Function to get attendance summary

exports.getAttendanceSummary = async (req, res) => {
  const pool = getPool(); 
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;

    // Fetch working days
    const today = new Date();

    //const year = today.getFullYear();

    const workingDaysResult = await pool.query(
      `SELECT SUM(total_working_days) AS total_working_days 
       FROM working_days_summary
       WHERE company_id = $1 AND year = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [companyId]
    );

  const currWorkingDays = await pool.query(
      `SELECT SUM(total_working_days) AS current_working_days
      FROM working_days_summary
      WHERE company_id = $1 
        AND year = EXTRACT(YEAR FROM CURRENT_DATE)
        AND month <= EXTRACT(MONTH FROM CURRENT_DATE)`,
      [companyId]
    );

    const annualWorkingDays = workingDaysResult.rows[0].total_working_days;
    const currentWorkingDays = parseInt(currWorkingDays.rows[0]?.current_working_days) || 0;

    console.log("Current working days: ", currentWorkingDays);

    if (annualWorkingDays === 0 || currentWorkingDays === 0) {
      return res.status(404).json({ error: 'No working days data found' });
    }

    const result = await pool.query(
          `SELECT 
             optional_holidays_taken,
             holidays_taken,
             unpaid_leave
           FROM leave_limits 
           WHERE employee_id = $1
           AND company_id = $2`,
          [userId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No leave limit set for this user' });
    }

    const {
      optional_holidays_taken,
      holidays_taken,
      unpaid_leave
    } = result.rows[0];

    const leaveTaken = 
        (optional_holidays_taken || 0) +
        (holidays_taken || 0) +
        (unpaid_leave || 0);

     // Fetch late clock-ins count
    const lateClockInResult = await pool.query(
      `SELECT COUNT(*) AS late_clockins
       FROM attendance a
       JOIN companies c ON a.company_id = c.id
       WHERE a.user_id = $2
         AND a.company_id = $1 
         AND EXTRACT(YEAR FROM a.date) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND a.clock_in::time > c.expected_clock_in`,
      [companyId, userId]
    );

    const lateClockIns = parseInt(lateClockInResult.rows[0].late_clockins) || 0;

    // Example data (replace with actual attendance calculations)
    const presentCount = currentWorkingDays - leaveTaken; // Example calculation
    const absentCount = leaveTaken; // Example: fetch actual absent days if needed
    const attendancePercentage = Math.round((presentCount / currentWorkingDays) * 100);

    res.json({
      attendancePercentage,
      presentCount,
      absentCount,
      workingDays: annualWorkingDays,
      leaveTaken,
      lateClockIns,
    });
  } catch (err) {
    console.error('Error fetching attendance summary:', err);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  const pool = getPool(); 
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id; 
    const { date } = req.params;

    const result = await pool.query(
      `SELECT a.clock_in, a.clock_out, c.expected_clock_in
       FROM attendance a
       JOIN companies c ON a.company_id = c.id
       WHERE a.user_id = $1 AND a.company_id = $2 AND a.date = $3`,
      [userId, companyId, date]
    );

    let responseData;

    if (result.rows.length === 0) {
      // User didn't clock in on this date
      responseData = {
        status: 'Absent',
        clock_in: null,
        clock_out: null,
        isLate: false,
        working_hours: 0,
      };
    } else {
      const data = result.rows[0];

      // Compute lateness
      const isLate = data.clock_in && data.clock_in.toTimeString().slice(0, 5) > data.expected_clock_in;

      // Calculate working hours
      let working_hours = 0;
      if (data.clock_in && data.clock_out) {
        const inTime = new Date(data.clock_in);
        const outTime = new Date(data.clock_out);
        working_hours = Math.round((outTime - inTime) / (1000 * 60 * 60)); // Hours
      }

      responseData = {
        status: data.clock_in && data.clock_out ? 'Present' : 'Half Day',
        clock_in: data.clock_in ? data.clock_in.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
        clock_out: data.clock_out ? data.clock_out.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A',
        isLate,
        working_hours,
      };
    }

    res.json(responseData);

  } catch (err) {
    console.error('Error fetching attendance by date:', err);
    res.status(500).json({ error: 'Failed to fetch attendance details' });
  }
};

exports.getStatus = async(req, res) => {
  const pool = getPool(); 
  const userId = req.user.id
  const companyId = req.user.company_id;
  const today = new Date().toISOString().split('T')[0];
  try{
    const result = await pool.query(`select status from attendance where user_id=$1 and company_id=$2 and date=$3`,
      [userId, companyId, today]
    );
    if (result.rows.length === 0) {
      res.json({ status: 'Clocked Out' });
    } else {
      res.json(result.rows[0]);
    }
  } catch(err){
    console.log("Error fetching status: ", err);
    res.status(500).json({ error: 'Failed to get status' });
  }
}

exports.approveManualClockIn = async (req, res) => {
  const pool = getPool(); 
  const { id, status } = req.params;
  console.log("Manual Entry ID: ", id);

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid decision' });
  }

  try {
    // Fetch manual entry details
    const result = await pool.query(
      `SELECT * FROM manual_entry WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Manual entry not found' });
    }

    const entry = result.rows[0];
    const { user_id, company_id, date, clock_in, clock_out, location, ip, coordinates } = entry;

    const dateStr = new Date(date).toISOString().split('T')[0];
    const clockInTimestamp = `${dateStr}T${clock_in}`;
    const clockOutTimestamp = `${dateStr}T${clock_out}`;

    if (status === 'Rejected') {
      await pool.query(
        `UPDATE leave_limits 
         SET skipped_entries = skipped_entries + 1 
         WHERE employee_id = $1 AND company_id = $2`,
        [user_id, company_id]
      );
    }

    if (status === 'Approved') {
      await pool.query(
        `INSERT INTO attendance (user_id, company_id, date, clock_in, clock_out, location, ip_address, location_coordinates, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [user_id, company_id, dateStr, clockInTimestamp, clockOutTimestamp, location, ip, coordinates, 'Clocked Out']
      );
    }

    // Delete the manual entry after processing
    await pool.query(`DELETE FROM manual_entry WHERE id = $1`, [id]);

    res.json({ message: `Manual clock-in ${status}` });

  } catch (err) {
    console.error("Error processing manual clock-in:", err);
    res.status(500).json({ error: 'Failed to process manual clock-in' });
  }
};

exports.getManualClockIns = async (req, res) => {
  const pool = getPool(); 
  const managerId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT L.*, U.name as user_name 
       FROM manual_entry L
       JOIN users U ON L.user_id = U.id
       WHERE U.manager_id = $1`,
      [managerId] // Pass manager ID as parameter
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching manual entries' });
  }
};