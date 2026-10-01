import { useParams } from 'react-router-dom';
import { useCsvs } from '../../data/useCsv';
import { getProfileByUserId, getUserById } from '../../data/selectors';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import { formatDateTime } from '../../utils/formatDate';
import { getLanguageName } from '../../utils/languages';

function UserDetailsPage() {
  const { id } = useParams();
  const { data, loading, error } = useCsvs(['users', 'profiles']);

  const user = data ? getUserById(data.users, id) : null;
  const profile = data ? getProfileByUserId(data.profiles, id) : null;

  return (
    <section>
      <h1>User Details</h1>
      <p>User ID: {id}</p>
      {loading && <Loader message="Loading user…" />}
      {error && <ErrorState message={error.message} />}
      {data && (
        <>
          {/* TEMP (Phase 2 check) — replaced by the details view in Phase 4 */}
          <p>
            Loaded users: {data.users.length}, profiles: {data.profiles.length}
          </p>
          {user && profile ? (
            <p>
              {user.name} · joined {formatDateTime(user.join_time)} · {getLanguageName(profile.language)}
            </p>
          ) : (
            <p>No user found for this ID.</p>
          )}
        </>
      )}
    </section>
  );
}

export default UserDetailsPage;
