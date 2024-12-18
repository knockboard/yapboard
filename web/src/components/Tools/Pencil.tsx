import useToolStore from "../../store/toolStore";
import { useEffect, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";
import { cn } from "../../lib/utils";

export default function PencilTool() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);
  const selectedStroke = useToolStore((state) => state.stroke);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "pencil") return;

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = selectedStroke;
    canvas.freeDrawingBrush.color = selectedColor;

    return () => {
      canvas.isDrawingMode = false;
    };
  }, [toolSelected, fabricRef, selectedColor, selectedStroke]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, initializeCanvasEvents]);

  return (
    <div
      className={cn("transition-all group hover:bg-gray-100", {
        "bg-gray-100": toolSelected === "pencil",
      })}
      onClick={() => setTool("pencil", undefined)}
    >
      <div
        className={cn("overflow-hidden  h-[76px] w-20 flex justify-center", {
          "group-hover:-translate-y-2 group-hover:h-[81px]":
            toolSelected !== "pencil",
        })}
      >
        <div
          className={cn("transition-all translate-y-3  left-1/2", {
            "group-hover:translate-y-0": toolSelected !== "pencil",
          })}
        >
          <img
            src="/pencil.png"
            alt="yapboard pencil"
            className={cn("w-auto h-20 pointer-events-none")}
          />
        </div>
      </div>
    </div>
  );
}
