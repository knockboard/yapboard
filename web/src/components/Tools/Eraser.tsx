import useToolStore from "../../store/toolStore";
import { useEffect, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import { cn } from "../../lib/utils";
import { TPointerEvent } from "fabric";

export default function Eraser() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const { setTool } = useToolStore();

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "eraser") return;

    canvas.isDrawingMode = false;

    const handleMouseMove = (event: { e: TPointerEvent }) => {
      const pointer = canvas.getPointer(event.e);
      const objectsToRemove = canvas.getObjects().filter((obj) => {
        return obj.containsPoint(pointer);
      });
      objectsToRemove.forEach((obj) => {
        canvas.remove(obj);
      });
      canvas.requestRenderAll();
    };

    canvas.on("mouse:down", () => {
      canvas.on("mouse:move", handleMouseMove);
    });

    canvas.on("mouse:up", () => {
      canvas.off("mouse:move", handleMouseMove);
    });

    return () => {
      canvas.off("mouse:down");
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up");
    };
  }, [toolSelected, fabricRef]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, initializeCanvasEvents]);

  return (
    <div
      className={cn("transition-all group hover:bg-gray-100", {
        "bg-gray-100": toolSelected === "eraser",
      })}
      onClick={() => {
        setTool("eraser", undefined);
      }}
    >
      <div
        className={cn("overflow-hidden h-[76px] w-20 flex justify-center", {
          "group-hover:-translate-y-2 group-hover:h-[81px]":
            toolSelected !== "eraser",
        })}
      >
        <div
          className={cn("transition-all translate-y-3 left-1/2", {
            "group-hover:translate-y-0": toolSelected !== "eraser",
          })}
        >
          <img
            src="/eraser.png"
            alt="yapboard eraser"
            className={cn("w-auto h-20 pointer-events-none")}
          />
        </div>
      </div>
    </div>
  );
}
