import DailyLearning from "../models/DailyLearning.js";
import { SpiritualPractice } from "../models/spiritualPracticeSchema.js";
import { User } from "../models/userSchema.js";
import { AppError } from "../utils/AppError.js";

/**
 * Collect distinct calendar dates (UTC) on which the user performed any
 * qualifying action:
 *   - DailyLearning  (isCompleted: true)
 *   - SpiritualPractice
 *
 * Returns an array of date strings sorted descending, e.g.
 *   [ "2026-02-25", "2026-02-24", "2026-02-22", … ]
 */
async function getActiveDays(userId, lookbackDays = 90) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - lookbackDays);

  const dateExpr = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

  const [learningDates, practiceDates] = await Promise.all([
    DailyLearning.aggregate([
      { $match: { userId, isCompleted: true, createdAt: { $gte: since } } },
      { $group: { _id: dateExpr } },
    ]),
    SpiritualPractice.aggregate([
      { $match: { userId, createdAt: { $gte: since } } },
      { $group: { _id: dateExpr } },
    ]),
  ]);

  const dateSet = new Set();
  for (const d of [...learningDates, ...practiceDates]) {
    dateSet.add(d._id);
  }

  return [...dateSet].sort().reverse(); // newest first
}

/**
 * Walk backwards from today counting consecutive active days.
 */
function computeCurrentStreak(sortedDatesDesc) {
  if (sortedDatesDesc.length === 0) return 0;

  const todayStr = new Date().toISOString().slice(0, 10);

  // The streak must include today or yesterday to be "current"
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const first = sortedDatesDesc[0];
  if (first !== todayStr && first !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDatesDesc.length; i++) {
    const prev = new Date(sortedDatesDesc[i - 1] + "T00:00:00Z");
    const curr = new Date(sortedDatesDesc[i] + "T00:00:00Z");
    const diff = (prev - curr) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Compute the longest streak ever.
 */
function computeLongestStreak(sortedDatesDesc) {
  if (sortedDatesDesc.length === 0) return 0;

  // Work in ascending order for easier logic
  const asc = [...sortedDatesDesc].reverse();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < asc.length; i++) {
    const prev = new Date(asc[i - 1] + "T00:00:00Z");
    const curr = new Date(asc[i] + "T00:00:00Z");
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

/**
 * @param {string} userId  Mongoose ObjectId string
 * @returns {{ current: number, goal: number, longest: number, activeDaysThisWeek: number }}
 */
export async function getUserStreak(userId) {
  const user = await User.findById(userId).select("streakGoal").lean();
  if (!user) throw new AppError("User not found", 404);

  const activeDays = await getActiveDays(userId);
  const current = computeCurrentStreak(activeDays);
  const longest = computeLongestStreak(activeDays);

  // Count active days in the current calendar week (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun,1=Mon…6=Sat
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const activeDaysThisWeek = activeDays.filter((d) => d >= weekStartStr).length;

  return {
    current,
    goal: user.streakGoal ?? 7,
    longest,
    activeDaysThisWeek,
  };
}

/**
 * Update the user's streak goal.
 * @param {string} userId
 * @param {number} newGoal  1–365
 */
export async function updateStreakGoal(userId, newGoal) {
  const goal = Number(newGoal);
  if (!Number.isInteger(goal) || goal < 1 || goal > 365) {
    throw new AppError("Streak goal must be an integer between 1 and 365", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { streakGoal: goal },
    { new: true, runValidators: true }
  ).select("streakGoal");

  if (!user) throw new AppError("User not found", 404);
  return { goal: user.streakGoal };
}
