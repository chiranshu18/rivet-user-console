import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCsvs } from '../../data/useCsv';
import { getSessionsByUserId, getUserById } from '../../data/selectors';
import usePersistentState from '../../hooks/usePersistentState';
import useSort from '../../hooks/useSort';
import usePagination from '../../hooks/usePagination';
import { filterBySelection } from '../../utils/filters';
import { compareNumbers, sortRows } from '../../utils/sorters';
import { formatDateTime } from '../../utils/formatDate';
import { todayStamp } from '../../utils/csvExport';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import MultiSelectFilter from '../../components/MultiSelectFilter/MultiSelectFilter';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import NotFoundState from '../../components/NotFoundState/NotFoundState';
import PageHeader from '../../components/PageHeader/PageHeader';
import Panel from '../../components/Panel/Panel';
import BackLink from '../../components/BackLink/BackLink';
import ExportCsvButton from '../../components/ExportCsvButton/ExportCsvButton';
import styles from './UserSessionsPage.module.scss';

const DEVICE_OPTIONS = ['Desktop', 'Mobile'];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COMPARATORS = { session_duration_minutes: compareNumbers };
const EXPORT_FIELDS = [
  'user_id',
  'session_start',
  'session_duration_minutes',
  'device',
  'entry_screen',
  'exit_screen',
];

// Remembered across visits and shared by all users' session tables. The page number is not
// remembered because it does not carry over meaningfully between users.
const STORAGE_KEYS = {
  devices: 'user-console:sessions:devices',
  sort: 'user-console:sessions:sort',
  pageSize: 'user-console:sessions:pageSize',
};
const isDeviceList = (value) =>
  Array.isArray(value) && value.every((device) => DEVICE_OPTIONS.includes(device));

const COLUMNS = [
  {
    key: 'session_start',
    header: 'Session Start',
    render: (session) => formatDateTime(session.session_start),
  },
  { key: 'session_duration_minutes', header: 'Duration (min)', sortable: true },
  { key: 'device', header: 'Device' },
  { key: 'entry_screen', header: 'Entry Screen' },
  { key: 'exit_screen', header: 'Exit Screen' },
];

const getRowKey = (session) => session.rowKey;

function UserSessionsPage() {
  const { id } = useParams();
  const { data, loading, error } = useCsvs(['users', 'sessions']);
  const [devices, setDevices] = usePersistentState(STORAGE_KEYS.devices, [], isDeviceList);
  const { sort, toggleSort } = useSort({
    storageKey: STORAGE_KEYS.sort,
    sortableKeys: ['session_duration_minutes'],
  });

  const user = data ? getUserById(data.users, id) : null;

  // Sessions have no unique ID column, so the row's position in the CSV is used as its key.
  const userSessions = useMemo(() => {
    if (!data) return [];
    return getSessionsByUserId(data.sessions, id).map((session, index) => ({
      ...session,
      rowKey: `${session.user_id}-${index}`,
    }));
  }, [data, id]);

  const visibleSessions = useMemo(() => {
    const filtered = filterBySelection(userSessions, 'device', devices);
    return sortRows(filtered, sort, COMPARATORS);
  }, [userSessions, devices, sort]);

  const pagination = usePagination(visibleSessions, {
    defaultPageSize: PAGE_SIZE_OPTIONS[0],
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    resetKey: JSON.stringify([id, devices, sort]),
    pageSizeStorageKey: STORAGE_KEYS.pageSize,
  });

  const emptyMessage =
    userSessions.length === 0
      ? 'No sessions recorded for this user.'
      : 'No sessions match the selected device.';

  return (
    <section>
      {loading && <Loader message="Loading sessions…" />}
      {error && <ErrorState message={error.message} />}

      {data && !user && (
        <NotFoundState
          title="User not found"
          message={`No user exists with ID "${id}".`}
          linkLabel="Back to Users"
        />
      )}

      {user && (
        <>
          <div className={styles.topBar}>
            <BackLink to={`/user/${user.user_id}`}>Back to {user.name}</BackLink>
          </div>

          <PageHeader
            title={`Sessions — ${user.name}`}
            subtitle={`${user.user_id} · ${userSessions.length} sessions in total`}
          />

          <Panel
            toolbar={
              <>
                <MultiSelectFilter
                  label="Device"
                  options={DEVICE_OPTIONS}
                  selected={devices}
                  onChange={setDevices}
                />
                <ExportCsvButton
                  rows={visibleSessions}
                  fields={EXPORT_FIELDS}
                  filename={`sessions-${user.user_id}-${todayStamp()}.csv`}
                />
              </>
            }
          >
            <DataTable
              columns={COLUMNS}
              rows={pagination.pageRows}
              getRowKey={getRowKey}
              sort={sort}
              onSort={toggleSort}
              emptyMessage={emptyMessage}
            />

            <Pagination
              page={pagination.page}
              pageCount={pagination.pageCount}
              pageSize={pagination.pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              total={pagination.total}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </Panel>
        </>
      )}
    </section>
  );
}

export default UserSessionsPage;
