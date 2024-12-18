import { Square } from "lucide-react";
import useToolStore from "../../store/toolStore";
import { useEffect, useState, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";
import useLogStore from "../../store/logStore";

export default function Rectangle() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef, zoomLevel } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);
  const setLogs = useLogStore((state) => state.setLogs);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState<fabric.Rect | null>(null);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "rectangle") return;

    const handleMouseDown = (event: { e: fabric.TPointerEvent }) => {
      const pointer = canvas.getPointer(event.e);
      setStartPos({ x: pointer.x, y: pointer.y });

      const newRect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        rx: 6,
        ry: 6,
        fill: selectedColor,
        selectable: true,
      });

      canvas.add(newRect);
      setRect(newRect);
      setIsDrawing(true);
    };

    const handleMouseMove = (event: { e: fabric.TPointerEvent }) => {
      if (!isDrawing || !rect) return;

      const pointer = canvas.getPointer(event.e);

      const width = pointer.x - startPos.x;
      const height = pointer.y - startPos.y;

      rect.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? startPos.x : pointer.x,
        top: height > 0 ? startPos.y : pointer.y,
      });

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing || !rect || !fabricRef.current) return;
      setIsDrawing(false);
      setTool("cursor", undefined);
      fabricRef.current.defaultCursor = "pointer";
      rect.setCoords();
      rect.selectable = true;
      canvas.renderAll();
      setLogs(`rectangle add: ${rect.width}x${rect.height} pixels.`, "info");
      setRect(null);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [
    fabricRef,
    toolSelected,
    selectedColor,
    isDrawing,
    rect,
    startPos.x,
    startPos.y,
  ]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents, zoomLevel]);

  return (
    <>
      <Square
        size={42}
        fill={selectedColor}
        color="#c1c1c1"
        strokeWidth={1}
        className="hover:scale-110"
        onClick={() => {
          setTool("rectangle", "shape");
          if (!fabricRef.current) return;
          fabricRef.current.defaultCursor = "crosshair";
        }}
      />
    </>
  );
}
