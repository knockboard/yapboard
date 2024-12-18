import { Slash } from "lucide-react";
import useToolStore from "../../store/toolStore";
import { useEffect, useState, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";
import useLogStore from "../../store/logStore";

export default function LineTool() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);
  const selectedStroke = useToolStore((state) => state.stroke);
  const setLogs = useLogStore((state) => state.setLogs);

  const [isDrawing, setIsDrawing] = useState(false);
  const [line, setLine] = useState<fabric.Line | null>(null);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "line") return;

    const handleMouseDown = (event: { e: fabric.TPointerEvent }) => {
      const pointer = canvas.getPointer(event.e);

      const newLine = new fabric.Line(
        [pointer.x, pointer.y, pointer.x, pointer.y],
        {
          stroke: selectedColor,
          strokeWidth: selectedStroke,
          selectable: true,
        }
      );

      canvas.add(newLine);
      setLine(newLine);
      setIsDrawing(true);
    };

    const handleMouseMove = (event: { e: fabric.TPointerEvent }) => {
      if (!isDrawing || !line) return;

      const pointer = canvas.getPointer(event.e);

      line.set({
        x2: pointer.x,
        y2: pointer.y,
      });

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing || !line || !fabricRef.current) return;

      setIsDrawing(false);
      setTool("cursor", undefined);
      fabricRef.current.defaultCursor = "pointer";
      line.setCoords();
      line.selectable = true;
      canvas.renderAll();
      setLogs(`line add: ${line.width}x${line.height} pixels.`, "info");
      setLine(null);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [fabricRef, toolSelected, selectedColor, selectedStroke, isDrawing, line]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents]);

  return (
    <>
      <Slash
        size={42}
        fill={selectedColor}
        color={selectedColor}
        strokeWidth={2}
        className="hover:scale-110"
        onClick={() => {
          setTool("line", "shape");
          if (!fabricRef.current) return;
          fabricRef.current.defaultCursor = "crosshair";
        }}
      />
    </>
  );
}
