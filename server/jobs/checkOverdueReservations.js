const Reservation = require('../models/Reservation');
const Penalty = require('../models/Penalty');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RUN_HOUR = Number(process.env.OVERDUE_JOB_HOUR || 8);
let overdueJobTimeout = null;

function computeLateDays(endDate, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const due = new Date(endDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - due.getTime();
  if (diffMs <= 0) {
    return 0;
  }

  return Math.ceil(diffMs / ONE_DAY_MS);
}

async function checkOverdueReservations(options = {}) {
  const penaltyPerDay = Number(options.penaltyPerDay || process.env.PENALTY_PER_DAY || 5);
  const now = options.now ? new Date(options.now) : new Date();

  const overdueReservations = await Reservation.find({
    status: 'approved',
    endDate: { $lt: now }
  }).select('_id userId endDate');

  let created = 0;
  let skipped = 0;

  for (const reservation of overdueReservations) {
    const daysLate = computeLateDays(reservation.endDate, now);
    if (daysLate <= 0) {
      skipped += 1;
      continue;
    }

    const exists = await Penalty.exists({ reservationId: reservation._id });
    if (exists) {
      skipped += 1;
      continue;
    }

    await Penalty.create({
      userId: reservation.userId,
      reservationId: reservation._id,
      daysLate,
      type: 'retard',
      description: `${daysLate} jour(s) de retard`,
      penaltyAmount: daysLate * penaltyPerDay,
      status: 'unpaid',
      source: 'auto-overdue'
    });

    created += 1;
  }

  const summary = {
    checked: overdueReservations.length,
    created,
    skipped,
    penaltyPerDay
  };

  console.log('[overdue-check]', summary);
  return summary;
}

function getNextRunAt(hour = DEFAULT_RUN_HOUR, now = new Date()) {
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

function clearOverdueSchedule() {
  if (overdueJobTimeout) {
    clearTimeout(overdueJobTimeout);
    overdueJobTimeout = null;
  }
}

function scheduleDailyOverdueCheck(options = {}) {
  const hour = Number(options.hour ?? DEFAULT_RUN_HOUR);
  const penaltyPerDay = options.penaltyPerDay;

  clearOverdueSchedule();

  const scheduleNextRun = () => {
    const now = new Date();
    const nextRun = getNextRunAt(hour, now);
    const delay = Math.max(1000, nextRun.getTime() - now.getTime());

    console.log(`[overdue-check] next run scheduled at ${nextRun.toISOString()}`);

    overdueJobTimeout = setTimeout(async () => {
      try {
        await checkOverdueReservations({ penaltyPerDay });
      } catch (error) {
        console.error('[overdue-check] scheduled run failed:', error.message);
      } finally {
        scheduleNextRun();
      }
    }, delay);
  };

  scheduleNextRun();
}

module.exports = {
  checkOverdueReservations,
  computeLateDays,
  scheduleDailyOverdueCheck,
  clearOverdueSchedule,
  getNextRunAt
};
