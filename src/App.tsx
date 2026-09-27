import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AppShell } from './components/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { DownscalingPage } from './pages/DownscalingPage';
import { PanchayatExplorerPage } from './pages/PanchayatExplorerPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { ValidationPage } from './pages/ValidationPage';

import { SplashScreen } from './components/SplashScreen';

function App() {
  return (
    <LanguageProvider>
      <SplashScreen />
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/downscaling" element={<DownscalingPage />} />
            <Route path="/panchayats" element={<PanchayatExplorerPage />} />
            <Route path="/advisory" element={<AdvisoryPage />} />
            <Route path="/validation" element={<ValidationPage />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
