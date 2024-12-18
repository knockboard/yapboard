import { create } from "zustand";

interface LogState {
  logs: Record<string, string>[];
  setLogs: (log: string, type: string) => void;
}

const useLogStore = create<LogState>()((set) => ({
  logs: [],
  setLogs: (log, type) =>
    set((state) => ({
      logs: [{ log: log, type: type }, ...state.logs],
    })),
}));

export default useLogStore;
