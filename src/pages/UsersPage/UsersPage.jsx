import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useCsv from '../../data/useCsv';
import useDebounce from '../../hooks/useDebounce';
import useSort from '../../hooks/useSort';
import usePagination from '../../hooks/usePagination';
import { filterByExactSearch, filterBySelection } from '../../utils/filters';
import { compareDateTimes, sortRows } from '../../utils/sorters';
import { formatDateTime } from '../../utils/formatDate';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SearchInput from '../../components/SearchInput/SearchInput';
import MultiSelectFilter from '../../components/MultiSelectFilter/MultiSelectFilter';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import styles from './UsersPage.module.scss';

const SEARCH_DEBOUNCE_MS = 500;
const SEARCH_FIELDS = ['name', 'user_id'];
const STATUS_OPTIONS = ['New', 'Returning', 'Deleted'];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COMPARATORS = { join_time: compareDateTimes };

const COLUMNS = [
  {
    key: 'user_id',
    header: 'User ID',
    render: (user) => <Link to={`/user/${user.user_id}`}>{user.user_id}</Link>,
  },
  { key: 'name', header: 'Name' },
  {
    key: 'join_time',
    header: 'Join Time',
    sortable: true,
    render: (user) => formatDateTime(user.join_time),
  },
  {
    key: 'status',
    header: 'Status',
    render: (user) => <StatusBadge status={user.status} />,
  },
  {
    key: 'last_active_time',
    header: 'Last Active Time',
    render: (user) => formatDateTime(user.last_active_time),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (user) => <Link to={`/user/${user.user_id}/sessions`}>View Sessions</Link>,
  },
];

const getRowKey = (user) => user.user_id;

function UsersPage() {
  const { data: users, loading, error } = useCsv('users');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState([]);
  const { sort, toggleSort } = useSort();
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const visibleUsers = useMemo(() => {
    if (!users) return [];
    const searched = filterByExactSearch(users, debouncedSearch, SEARCH_FIELDS);
    const filtered = filterBySelection(searched, 'status', statuses);
    return sortRows(filtered, sort, COMPARATORS);
  }, [users, debouncedSearch, statuses, sort]);

  const pagination = usePagination(visibleUsers, {
    defaultPageSize: PAGE_SIZE_OPTIONS[0],
    resetKey: JSON.stringify([debouncedSearch, statuses, sort]),
  });

  return (
    <section>
      <header className={styles.header}>
        <h1>Users</h1>
        {users && <p className={styles.subtitle}>{users.length} users in total</p>}
      </header>

      {loading && <Loader message="Loading users…" />}
      {error && <ErrorState message={error.message} />}

      {users && (
        <div className={styles.panel}>
          <div className={styles.toolbar}>
            <SearchInput
              label="Search by name or user ID (exact match)"
              value={search}
              onChange={setSearch}
              placeholder="e.g. User5 or u0005"
            />
            <MultiSelectFilter
              label="Status"
              options={STATUS_OPTIONS}
              selected={statuses}
              onChange={setStatuses}
            />
          </div>

          <DataTable
            columns={COLUMNS}
            rows={pagination.pageRows}
            getRowKey={getRowKey}
            sort={sort}
            onSort={toggleSort}
            emptyMessage="No users match your search or filters."
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
        </div>
      )}
    </section>
  );
}

export default UsersPage;
