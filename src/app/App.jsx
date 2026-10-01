import { BrowserRouter, useRoutes } from 'react-router-dom';
import { ThemeProvider } from '../theme/ThemeContext';
import routes from './routes';

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
