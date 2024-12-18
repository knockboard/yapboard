import { Circle } from "lucide-react";
import useToolStore from "../../store/toolStore";
import { useEffect, useState, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";
import useLogStore from "../../store/logStore";

export default function EllipseTool() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);
  const setLogs = useLogStore((state) => state.setLogs);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [ellipse, setEllipse] = useState<fabric.Ellipse | null>(null);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "circle") return;

    const handleMouseDown = (event: { e: fabric.TPointerEvent }) => {
      const pointer = canvas.getPointer(event.e);
      setStartPos({ x: pointer.x, y: pointer.y });

      const newEllipse = new fabric.Ellipse({
        left: pointer.x,
        top: pointer.y,
        rx: 0,
        ry: 0,
        fill: selectedColor,
        selectable: true,
      });

      canvas.add(newEllipse);
      setEllipse(newEllipse);
      setIsDrawing(true);
    };

    const handleMouseMove = (event: { e: fabric.TPointerEvent }) => {
      if (!isDrawing || !ellipse) return;

      const pointer = canvas.getPointer(event.e);
      const width = pointer.x - startPos.x;
      const height = pointer.y - startPos.y;

      ellipse.set({
        rx: Math.abs(width),
        ry: Math.abs(height),
        left: width > 0 ? startPos.x : pointer.x - Math.abs(width),
        top: height > 0 ? startPos.y : pointer.y - Math.abs(height),
      });

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing || !ellipse || !fabricRef.current) return;

      setIsDrawing(false);
      setTool("cursor", undefined);
      fabricRef.current.defaultCursor = "pointer";
      ellipse.setCoords();
      ellipse.selectable = true;
      canvas.renderAll();
      setLogs(
        `ellipse add: ${ellipse.width}x${ellipse.height} pixels.`,
        "info"
      );
      setEllipse(null);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [toolSelected, fabricRef, isDrawing, startPos, ellipse, selectedColor]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents]);

  return (
    <>
      <Circle
        size={42}
        fill={selectedColor}
        color="#c1c1c1"
        strokeWidth={1}
        className="hover:scale-110"
        onClick={() => {
          setTool("circle", "shape");
          if (!fabricRef.current) return;
          fabricRef.current.defaultCursor = "crosshair";
        }}
      />
    </>
  );
}
