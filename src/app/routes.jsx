import { Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import UsersPage from '../pages/UsersPage/UsersPage';
import UserDetailsPage from '../pages/UserDetailsPage/UserDetailsPage';
import UserSessionsPage from '../pages/UserSessionsPage/UserSessionsPage';
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to="/users" replace /> },
      { path: '/users', element: <UsersPage /> },
      { path: '/user/:id', element: <UserDetailsPage /> },
      { path: '/user/:id/sessions', element: <UserSessionsPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export default routes;
