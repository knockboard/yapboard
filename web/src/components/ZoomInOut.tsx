import { Minus, Plus } from "lucide-react";
import useCanvasStore from "../store/canvasStore";

interface Props {
  zoomByPoint: (point: { x: number; y: number }, factor: number) => void;
}

export default function ZoomInOut({ zoomByPoint }: Props) {
  const zoomLevel = useCanvasStore((state) => state.zoomLevel);
  const { fabricRef } = useCanvasStore();

  const handleZoomIn = (e: React.MouseEvent): void => {
    const point = {
      x: e.clientX || (fabricRef.current?.width || 0) / 2,
      y: e.clientY || (fabricRef.current?.height || 0) / 2,
    };
    zoomByPoint(point, 1.1);
  };

  const handleZoomOut = (e: React.MouseEvent): void => {
    const point = {
      x: e.clientX || (fabricRef.current?.width || 0) / 2,
      y: e.clientY || (fabricRef.current?.height || 0) / 2,
    };
    zoomByPoint(point, 0.9);
  };

  return (
    <div className="absolute flex items-center gap-1 bg-white border-2 rounded-lg left-2 bottom-2">
      <button className="p-2 hover:bg-gray-100" onClick={handleZoomOut}>
        <Minus size={24} strokeWidth={1} />
      </button>
      <span className="text-gray-600">{zoomLevel}%</span>
      <button className="p-2 hover:bg-gray-100" onClick={handleZoomIn}>
        <Plus size={24} strokeWidth={1} />
      </button>
    </div>
  );
}
