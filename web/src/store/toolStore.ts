import { create } from "zustand";

interface ToolState {
  type: string | undefined;
  toolSelected: string;
  color: string;
  stroke: number;
  fontFamily: string;
  stampSelected: string | undefined;
  setTool: (tool: string, type: string | undefined) => void;
  setColor: (color: string) => void;
  setStamp: (stamp: string | undefined) => void;
  setFontFamily: (font: string) => void;
  setStroke: (stroke: number) => void;
}

const useToolStore = create<ToolState>()((set) => ({
  type: undefined,
  toolSelected: "cursor",
  color: "#e4ccff",
  stroke: 4,
  stampSelected: undefined,
  fontFamily: "Fuzzy Bubbles",
  setTool: (tool, type = undefined) => {
    if (tool !== "stamp") {
      set(() => ({ stampSelected: undefined }));
    }
    set(() => ({ toolSelected: tool, type: type }));
  },
  setColor: (color) => set(() => ({ color: color })),
  setStamp: (stamp) => set(() => ({ stampSelected: stamp })),
  setFontFamily: (font) => set(() => ({ fontFamily: font })),
  setStroke: (stroke) => set(() => ({ stroke: stroke })),
}));

export default useToolStore;
