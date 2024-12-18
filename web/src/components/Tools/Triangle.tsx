import { Triangle } from "lucide-react";
import useToolStore from "../../store/toolStore";
import { useEffect, useState, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";

export default function TriangleTool() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [triangle, setTriangle] = useState<fabric.Triangle | null>(null);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "triangle") return;

    const handleMouseDown = (event: { e: fabric.TPointerEvent }) => {
      const pointer = canvas.getPointer(event.e);
      setStartPos({ x: pointer.x, y: pointer.y });

      const newTriangle = new fabric.Triangle({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: selectedColor,
        selectable: true,
      });

      canvas.add(newTriangle);
      setTriangle(newTriangle);
      setIsDrawing(true);
    };

    const handleMouseMove = (event: { e: fabric.TPointerEvent }) => {
      if (!isDrawing || !triangle) return;

      const pointer = canvas.getPointer(event.e);
      const width = pointer.x - startPos.x;
      const height = pointer.y - startPos.y;

      triangle.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? startPos.x : pointer.x - Math.abs(width),
        top: height > 0 ? startPos.y : pointer.y - Math.abs(height),
      });

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing || !triangle || !fabricRef.current) return;

      setIsDrawing(false);
      setTool("cursor", undefined);
      fabricRef.current.defaultCursor = "pointer";
      triangle.setCoords();
      triangle.selectable = true;
      canvas.renderAll();
      setTriangle(null);
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
    triangle,
    startPos.x,
    startPos.y,
  ]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents]);

  return (
    <>
      <Triangle
        size={42}
        fill={selectedColor}
        color="#c1c1c1"
        strokeWidth={1}
        className="hover:scale-110"
        onClick={() => {
          setTool("triangle", "shape");
          if (!fabricRef.current) return;
          fabricRef.current.defaultCursor = "crosshair";
        }}
      />
    </>
  );
}
