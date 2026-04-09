const Reservation = require('../models/Reservation');
const Penalty = require('../models/Penalty');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
      penaltyAmount: daysLate * penaltyPerDay,
      status: 'unpaid'
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

module.exports = {
  checkOverdueReservations,
  computeLateDays
};
