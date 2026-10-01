import { useMemo } from 'react';
import { useCsvs } from '../../data/useCsv';
import {
  METRIC_DESCRIPTIONS,
  getAppVersionDistribution,
  getAverageSessionDuration,
  getDailyActiveUsers,
  getDeletedUserPercent,
  getNewVsReturning,
  getTotalUsers,
} from '../../analytics/metrics';
import { formatDate } from '../../utils/formatDate';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import PageHeader from '../../components/PageHeader/PageHeader';
import MetricCard from '../../components/MetricCard/MetricCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import DailyActiveUsersChart from './DailyActiveUsersChart';
import NewVsReturningChart from './NewVsReturningChart';
import AppVersionChart from './AppVersionChart';
import styles from './AnalyticsPage.module.scss';

function AnalyticsPage() {
  const { data, loading, error } = useCsvs(['users', 'profiles', 'sessions', 'analytics']);

  const metrics = useMemo(() => {
    if (!data) return null;
    return {
      totalUsers: getTotalUsers(data.users),
      averageSessionDuration: getAverageSessionDuration(data.sessions),
      deletedUserPercent: getDeletedUserPercent(data.users),
      dailyActiveUsers: getDailyActiveUsers(data.analytics),
      newVsReturning: getNewVsReturning(data.users),
      appVersionDistribution: getAppVersionDistribution(data.profiles),
    };
  }, [data]);

  const dauRange = metrics?.dailyActiveUsers.length
    ? `${formatDate(metrics.dailyActiveUsers[0].date)} – ${formatDate(
        metrics.dailyActiveUsers[metrics.dailyActiveUsers.length - 1].date
      )}`
    : '';

  return (
    <section>
      <PageHeader title="Analytics" subtitle="Key user metrics and trends" />

      {loading && <Loader message="Loading analytics…" />}
      {error && <ErrorState message={error.message} />}

      {metrics && (
        <>
          <div className={styles.metrics}>
            <MetricCard
              label="Total Users"
              value={metrics.totalUsers}
              description={METRIC_DESCRIPTIONS.totalUsers}
            />
            <MetricCard
              label="Average Session Duration"
              value={`${metrics.averageSessionDuration.toFixed(1)} min`}
              description={METRIC_DESCRIPTIONS.averageSessionDuration}
            />
            <MetricCard
              label="Deleted User %"
              value={`${metrics.deletedUserPercent.toFixed(1)}%`}
              description={METRIC_DESCRIPTIONS.deletedUserPercent}
            />
          </div>

          <div className={styles.charts}>
            <ChartCard
              title="Daily Active Users"
              description={`${METRIC_DESCRIPTIONS.dailyActiveUsers}, ${dauRange}`}
              className={styles.fullWidth}
            >
              <DailyActiveUsersChart data={metrics.dailyActiveUsers} />
            </ChartCard>

            <ChartCard title="New vs Returning Users" description={METRIC_DESCRIPTIONS.newVsReturning}>
              <NewVsReturningChart data={metrics.newVsReturning} />
            </ChartCard>

            <ChartCard
              title="App Version Distribution"
              description={`${METRIC_DESCRIPTIONS.appVersionDistribution} (${metrics.appVersionDistribution.length} versions)`}
              className={styles.wide}
            >
              <AppVersionChart data={metrics.appVersionDistribution} />
            </ChartCard>
          </div>
        </>
      )}
    </section>
  );
}

export default AnalyticsPage;
