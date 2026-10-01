import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCsvs } from '../../data/useCsv';
import { getProfileByUserId, getUserById } from '../../data/selectors';
import { formatDateTime } from '../../utils/formatDate';
import { getLanguageName } from '../../utils/languages';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import NotFoundState from '../../components/NotFoundState/NotFoundState';
import SearchForm from '../../components/SearchForm/SearchForm';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Modal from '../../components/Modal/Modal';
import BackLink from '../../components/BackLink/BackLink';
import styles from './UserDetailsPage.module.scss';

const DETAIL_FIELDS = [
  { label: 'Join Time', getValue: (user) => formatDateTime(user.join_time) },
  { label: 'App Version', getValue: (user, profile) => profile?.app_version },
  { label: 'Device Info', getValue: (user, profile) => profile?.device_info },
  { label: 'Location', getValue: (user, profile) => profile?.location },
  { label: 'Language', getValue: (user, profile) => getLanguageName(profile?.language) },
];

function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useCsvs(['users', 'profiles']);
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isImageOpen, setIsImageOpen] = useState(false);

  const user = data ? getUserById(data.users, id) : null;
  const profile = data ? getProfileByUserId(data.profiles, id) : null;

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setSearchError('');
  };

  const handleSearch = (value) => {
    if (!data) return;
    const query = value.trim();
    if (!query) {
      setSearchError('Enter a user ID, e.g. u0010.');
      return;
    }
    const match = getUserById(data.users, query);
    if (!match) {
      setSearchError(`User not found: ${query}`);
      return;
    }
    setSearchValue('');
    navigate(`/user/${match.user_id}`);
  };

  return (
    <section>
      <div className={styles.topBar}>
        <BackLink to="/users">Back to Users</BackLink>
        <SearchForm
          label="Search by User ID"
          placeholder="e.g. u0010"
          value={searchValue}
          onChange={handleSearchChange}
          onSubmit={handleSearch}
          error={searchError}
        />
      </div>

      {loading && <Loader message="Loading user…" />}
      {error && <ErrorState message={error.message} />}

      {data && !user && (
        <NotFoundState
          title="User not found"
          message={`No user exists with ID "${id}".`}
          linkLabel="Back to Users"
        />
      )}

      {user && (
        <article className={styles.card}>
          <header className={styles.profileHeader}>
            {profile && (
              <button
                type="button"
                className={styles.thumbnailButton}
                onClick={() => setIsImageOpen(true)}
                aria-label={`View larger profile picture of ${user.name}`}
              >
                <img
                  src={profile.profile_thumbnail_url}
                  alt=""
                  width="64"
                  height="64"
                  className={styles.thumbnail}
                />
              </button>
            )}
            <div className={styles.identity}>
              <h1 className={styles.name}>{user.name}</h1>
              <p className={styles.meta}>
                <span>{user.user_id}</span>
                <StatusBadge status={user.status} />
              </p>
            </div>
            <Link to={`/user/${user.user_id}/sessions`} className={styles.sessionsButton}>
              View Sessions
            </Link>
          </header>

          <dl className={styles.details}>
            {DETAIL_FIELDS.map(({ label, getValue }) => (
              <div key={label} className={styles.detail}>
                <dt>{label}</dt>
                <dd>{getValue(user, profile) || '—'}</dd>
              </div>
            ))}
          </dl>
        </article>
      )}

      {profile && user && (
        <Modal
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          title={`${user.name} — profile picture`}
        >
          <img
            src={profile.profile_full_url}
            alt={`Profile of ${user.name}`}
            width="512"
            height="512"
            className={styles.fullImage}
          />
        </Modal>
      )}
    </section>
  );
}

export default UserDetailsPage;
