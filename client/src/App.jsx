import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BusinessIntelligence from './pages/BusinessIntelligence';
import Financials from './pages/Financials';
import EmployeeManagement from './pages/EmployeeManagement';
import ComplianceOverview from './pages/compliance/ComplianceOverview';
import ComplianceSystemLayout from './pages/compliance/ComplianceSystemLayout';
import ChangeSimulator from './pages/compliance/ChangeSimulator';
import EvidenceTracking from './pages/compliance/EvidenceTracking';
import OversightSandbox from './pages/compliance/OversightSandbox';
import ActivityHistory from './pages/compliance/ActivityHistory';
import ChangeReviewPack from './pages/compliance/ChangeReviewPack';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="business-intelligence" element={<BusinessIntelligence />} />
          <Route path="financials" element={<Financials />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="compliance" element={<ComplianceOverview />} />
          <Route path="compliance/systems/:systemId" element={<ComplianceSystemLayout />}>
            <Route index element={<Navigate to="changes/new" replace />} />
            <Route path="changes/new" element={<ChangeSimulator />} />
            <Route path="evidence" element={<EvidenceTracking />} />
            <Route path="oversight" element={<OversightSandbox />} />
            <Route path="activity" element={<ActivityHistory />} />
            <Route path="review-pack" element={<ChangeReviewPack />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
