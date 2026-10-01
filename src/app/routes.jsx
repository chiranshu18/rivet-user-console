import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Loader from '../components/Loader/Loader';
import UsersPage from '../pages/UsersPage/UsersPage';
import UserDetailsPage from '../pages/UserDetailsPage/UserDetailsPage';
import UserSessionsPage from '../pages/UserSessionsPage/UserSessionsPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

// Loaded on demand so recharts is not part of the initial bundle.
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage/AnalyticsPage'));

const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/users" replace /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/user/:id', element: <UserDetailsPage /> },
      { path: '/user/:id/sessions', element: <UserSessionsPage /> },
      {
        path: '/analytics',
        element: (
          <Suspense fallback={<Loader message="Loading analytics…" />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export default routes;
