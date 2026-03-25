import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BusinessIntelligence from './pages/BusinessIntelligence';
import Financials from './pages/Financials';
import EmployeeManagement from './pages/EmployeeManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="business-intelligence" element={<BusinessIntelligence />} />
          <Route path="financials" element={<Financials />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
