import { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import { useSensorSimulator } from './hooks/useSensorSimulator';
import HomePage from './pages/HomePage';
import MachineDetailPage from './pages/MachineDetailPage';
import RCAPage from './pages/RCAPage';
import FailurePredictionPage from './pages/FailurePredictionPage';
import ReportGeneratorPage from './pages/ReportGeneratorPage';
import ChatbotPage from './pages/ChatbotPage';
import EnergyPage from './pages/EnergyPage';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';

const MachineContext = createContext();

export const useMachineContext = () => useContext(MachineContext);

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sensorData = useSensorSimulator();

  const contextValue = {
    ...sensorData,
    sidebarCollapsed,
    setSidebarCollapsed
  };

  return (
    <MachineContext.Provider value={contextValue}>
      <Router>
        <div className="min-h-screen bg-background">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            setCollapsed={setSidebarCollapsed}
            latestReadings={sensorData.latestReadings}
            machineIds={sensorData.machineIds}
          />
          <Header 
            alerts={sensorData.alerts}
            markAllRead={sensorData.markAllAlertsRead}
          />
          
          <main className="pt-16 lg:pl-64 transition-all duration-300">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/machine/:machineId" element={<MachineDetailPage />} />
              <Route path="/rca" element={<RCAPage />} />
              <Route path="/predict" element={<FailurePredictionPage />} />
              <Route path="/report" element={<ReportGeneratorPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/energy" element={<EnergyPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <ChatbotWidget />
        </div>
      </Router>
    </MachineContext.Provider>
  );
}

export default App;
