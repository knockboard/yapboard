import { Minus, Plus } from "lucide-react";
import useCanvasStore from "../store/canvasStore";

interface Props {
  handleZoomIn: (e: React.MouseEvent) => void;
  handleZoomOut: (e: React.MouseEvent) => void;
}

export default function ZoomInOut({ handleZoomIn, handleZoomOut }: Props) {
  const zoomLevel = useCanvasStore((state) => state.zoomLevel);

  return (
    <div className="absolute flex items-center gap-1 bg-white border-2 rounded-lg left-2 bottom-2">
      <div className="p-2 hover:bg-gray-100" onClick={handleZoomOut}>
        <Minus size={24} strokeWidth={1} />
      </div>
      <span className="text-gray-600">{zoomLevel}%</span>
      <div className="p-2 hover:bg-gray-100" onClick={handleZoomIn}>
        <Plus size={24} strokeWidth={1} />
      </div>
    </div>
  );
}
