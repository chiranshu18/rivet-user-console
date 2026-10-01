import { useParams } from 'react-router-dom';
import useCsv from '../../data/useCsv';
import { getSessionsByUserId } from '../../data/selectors';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';

function UserSessionsPage() {
  const { id } = useParams();
  const { data: sessions, loading, error } = useCsv('sessions');

  return (
    <section>
      <h1>User Sessions</h1>
      <p>User ID: {id}</p>
      {loading && <Loader message="Loading sessions…" />}
      {error && <ErrorState message={error.message} />}
      {sessions && (
        <>
          {/* TEMP (Phase 2 check) — replaced by the sessions table in Phase 5 */}
          <p>Loaded sessions: {sessions.length}</p>
          <p>Sessions for this user: {getSessionsByUserId(sessions, id).length}</p>
        </>
      )}
    </section>
  );
}

export default UserSessionsPage;
