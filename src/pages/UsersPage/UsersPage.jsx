import useCsv from '../../data/useCsv';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatDateTime } from '../../utils/formatDate';

function UsersPage() {
  const { data: users, loading, error } = useCsv('users');

  return (
    <section>
      <h1>Users</h1>
      {loading && <Loader message="Loading users…" />}
      {error && <ErrorState message={error.message} />}
      {users && (
        <>
          {/* TEMP (Phase 2 check) — replaced by the Users table in Phase 3 */}
          <p>Loaded users: {users.length}</p>
          <p>
            First user joined: {users[0].join_time} → {formatDateTime(users[0].join_time)}
          </p>
        </>
      )}
    </section>
  );
}

export default UsersPage;
