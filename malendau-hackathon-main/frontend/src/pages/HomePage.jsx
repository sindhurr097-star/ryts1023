import { useMachineContext } from '../App';
import MachineFleetCard from '../components/Dashboard/MachineFleetCard';
import AlertFeed from '../components/Dashboard/AlertFeed';
import FleetHealthBar from '../components/Dashboard/FleetHealthBar';

const HomePage = () => {
  const { latestReadings, history, alerts, machines, dismissAlert, machineIds } = useMachineContext();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Fleet Health Bar */}
        <FleetHealthBar 
          latestReadings={latestReadings}
          machineIds={machineIds}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Machine Fleet Cards */}
          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-textPrimary text-xl mb-4">
              Machine Fleet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machineIds.map((machineId) => (
                <MachineFleetCard
                  key={machineId}
                  machineId={machineId}
                  machineLabel={machines[machineId]?.label}
                  reading={latestReadings[machineId]}
                  history={history[machineId]}
                />
              ))}
            </div>
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-1">
            <AlertFeed 
              alerts={alerts}
              onDismiss={dismissAlert}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
