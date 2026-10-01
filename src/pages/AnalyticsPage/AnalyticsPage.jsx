import { useCsvs } from '../../data/useCsv';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';

function AnalyticsPage() {
  const { data, loading, error } = useCsvs(['users', 'profiles', 'sessions', 'analytics']);

  return (
    <section>
      <h1>Analytics</h1>
      {loading && <Loader message="Loading analytics…" />}
      {error && <ErrorState message={error.message} />}
      {data && (
        // TEMP (Phase 2 check) — replaced by the dashboard in Phase 6
        <ul>
          <li>users: {data.users.length}</li>
          <li>profiles: {data.profiles.length}</li>
          <li>sessions: {data.sessions.length}</li>
          <li>analytics: {data.analytics.length}</li>
          <li>
            analytics numeric check: typeof daily_active_users = {typeof data.analytics[0].daily_active_users}
          </li>
        </ul>
      )}
    </section>
  );
}

export default AnalyticsPage;
