import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useCsv from '../../data/useCsv';
import useDebounce from '../../hooks/useDebounce';
import usePersistentState from '../../hooks/usePersistentState';
import useSort from '../../hooks/useSort';
import usePagination from '../../hooks/usePagination';
import { filterByPartialSearch, filterBySelection } from '../../utils/filters';
import { compareDateTimes, sortRows } from '../../utils/sorters';
import { formatDateTime } from '../../utils/formatDate';
import { todayStamp } from '../../utils/csvExport';
import DataTable from '../../components/DataTable/DataTable';
import Pagination from '../../components/Pagination/Pagination';
import SearchInput from '../../components/SearchInput/SearchInput';
import MultiSelectFilter from '../../components/MultiSelectFilter/MultiSelectFilter';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Loader from '../../components/Loader/Loader';
import ErrorState from '../../components/ErrorState/ErrorState';
import PageHeader from '../../components/PageHeader/PageHeader';
import Panel from '../../components/Panel/Panel';
import ExportCsvButton from '../../components/ExportCsvButton/ExportCsvButton';

const SEARCH_DEBOUNCE_MS = 500;
const SEARCH_FIELDS = ['name', 'user_id'];
const STATUS_OPTIONS = ['New', 'Returning', 'Deleted'];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COMPARATORS = { join_time: compareDateTimes };
const EXPORT_FIELDS = ['user_id', 'name', 'join_time', 'status', 'last_active_time'];

// Table state remembered across visits (localStorage).
const STORAGE_KEYS = {
  search: 'user-console:users:search',
  statuses: 'user-console:users:statuses',
  sort: 'user-console:users:sort',
  page: 'user-console:users:page',
  pageSize: 'user-console:users:pageSize',
};
const isString = (value) => typeof value === 'string';
const isStatusList = (value) =>
  Array.isArray(value) && value.every((status) => STATUS_OPTIONS.includes(status));

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
  const [search, setSearch] = usePersistentState(STORAGE_KEYS.search, '', isString);
  const [statuses, setStatuses] = usePersistentState(STORAGE_KEYS.statuses, [], isStatusList);
  const { sort, toggleSort } = useSort({
    storageKey: STORAGE_KEYS.sort,
    sortableKeys: ['join_time'],
  });
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const visibleUsers = useMemo(() => {
    if (!users) return [];
    const searched = filterByPartialSearch(users, debouncedSearch, SEARCH_FIELDS);
    const filtered = filterBySelection(searched, 'status', statuses);
    return sortRows(filtered, sort, COMPARATORS);
  }, [users, debouncedSearch, statuses, sort]);

  const pagination = usePagination(visibleUsers, {
    defaultPageSize: PAGE_SIZE_OPTIONS[0],
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    resetKey: JSON.stringify([debouncedSearch, statuses, sort]),
    pageStorageKey: STORAGE_KEYS.page,
    pageSizeStorageKey: STORAGE_KEYS.pageSize,
  });

  return (
    <section>
      <PageHeader title="Users" subtitle={users && `${users.length} users in total`} />

      {loading && <Loader message="Loading users…" />}
      {error && <ErrorState message={error.message} />}

      {users && (
        <Panel
          toolbar={
            <>
              <SearchInput
                label="Search by name or user ID"
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
              <ExportCsvButton
                rows={visibleUsers}
                fields={EXPORT_FIELDS}
                filename={`users-${todayStamp()}.csv`}
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
        </Panel>
      )}
    </section>
  );
}

export default UsersPage;
