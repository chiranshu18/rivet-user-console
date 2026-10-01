/**
 * Analytics dashboard metric definitions.
 * Every number/chart on /analytics comes from a function in this file, and the short
 * "source" text shown under each one comes from METRIC_DESCRIPTIONS below.
 * Options and their values are documented in IMPLEMENTATION_PLAN.md, Section 6.
 * To change a metric: edit its function + description here and update Section 6.
 */
import { compareSemver } from '../utils/sorters';

export const METRIC_DESCRIPTIONS = {
  totalUsers: 'All users in users.csv',
  averageSessionDuration: 'Mean duration across all sessions',
  deletedUserPercent: 'Users with status Deleted, out of all users',
  dailyActiveUsers: 'Daily active users from analytics.csv',
  newVsReturning: 'Current user status (Deleted users excluded)',
  appVersionDistribution: 'Number of users on each app version',
};

/** Option 1a — count of all rows in users.csv. */
export function getTotalUsers(users) {
  return users.length;
}

/** Option 4a — mean of session_duration_minutes over all sessions, in minutes. */
export function getAverageSessionDuration(sessions) {
  if (sessions.length === 0) return 0;
  const total = sessions.reduce((sum, session) => sum + session.session_duration_minutes, 0);
  return total / sessions.length;
}

/** Option 2a — Deleted users ÷ all users × 100. */
export function getDeletedUserPercent(users) {
  if (users.length === 0) return 0;
  const deleted = users.filter((user) => user.status === 'Deleted').length;
  return (deleted / users.length) * 100;
}

/** Option 5a — analytics.csv daily_active_users, oldest date first. */
export function getDailyActiveUsers(analytics) {
  return analytics
    .map((row) => ({ date: row.date, value: row.daily_active_users }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Option 3a — users.csv status counts for New and Returning (Deleted excluded). */
export function getNewVsReturning(users) {
  return ['New', 'Returning'].map((status) => ({
    name: status,
    value: users.filter((user) => user.status === status).length,
  }));
}

/** Option 6a — users per exact app_version (all users), sorted by version ascending. */
export function getAppVersionDistribution(profiles) {
  const counts = new Map();
  profiles.forEach(({ app_version: version }) => {
    counts.set(version, (counts.get(version) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([version, count]) => ({ version, count }))
    .sort((a, b) => compareSemver(a.version, b.version));
}
