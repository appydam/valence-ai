import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { SIMULATION_DATA, type SimulationDataSet } from "./simulationData";

const STORAGE_KEY = "ads_simulate_mode";

interface SimulationContextValue {
  isSimulating: boolean;
  setSimulating: (v: boolean) => void;
  simData: SimulationDataSet;
}

const SimulationContext = createContext<SimulationContextValue>({
  isSimulating: false,
  setSimulating: () => {},
  simData: SIMULATION_DATA,
});

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [isSimulating, setIsSimulatingRaw] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setSimulating = useCallback((v: boolean) => {
    setIsSimulatingRaw(v);
    try {
      localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // ignore
    }
  }, []);

  return (
    <SimulationContext.Provider value={{ isSimulating, setSimulating, simData: SIMULATION_DATA }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}
