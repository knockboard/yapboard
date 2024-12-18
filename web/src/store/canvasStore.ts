import { create } from "zustand";
import * as fabric from "fabric";

interface CustomFabricCanvas extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
  panMode?: boolean;
}

interface CanvasStore {
  zoomLevel: number;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  fabricRef: React.MutableRefObject<CustomFabricCanvas | null>;
  setZoomLevel: (zoomLevel: number) => void;
  setCanvasRef: (ref: HTMLCanvasElement | null) => void;
  setFabricRef: (ref: fabric.Canvas | null) => void;
}

const useCanvasStore = create<CanvasStore>((set) => ({
  canvasRef: { current: null },
  fabricRef: { current: null },
  zoomLevel: 100,
  setZoomLevel: (zoomLevel) => set(() => ({ zoomLevel: zoomLevel })),
  setCanvasRef: (ref) => set(() => ({ canvasRef: { current: ref } })),
  setFabricRef: (ref) => set(() => ({ fabricRef: { current: ref } })),
}));

export default useCanvasStore;
