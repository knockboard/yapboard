import useToolStore from "../../store/toolStore";
import { useEffect, useCallback } from "react";
import useCanvasStore from "../../store/canvasStore";
import { cn } from "../../lib/utils";
import * as fabric from "fabric";

export default function Eraser() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const { setTool } = useToolStore();

  const configureCanvas = useCallback((canvas: fabric.Canvas) => {
    canvas.defaultCursor = "crosshair";
    canvas.selection = false;
    canvas.discardActiveObject();

    canvas.getObjects().forEach((obj) => {
      obj.selectable = false;
      obj.hoverCursor = "crosshair";
    });

    canvas.requestRenderAll();
  }, []);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "eraser") return;
    configureCanvas(canvas);

    const itemsToDelete = new Set<fabric.Object>();
    let isMouseDown = false;

    const handleMouseDown = () => {
      isMouseDown = true;
    };

    const handleMouseMove = (event: any) => {
      if (!isMouseDown) return;
      const pointer = canvas.getPointer(event.e);
      const objectsToRemove = canvas.getObjects().filter((obj) => {
        return obj.containsPoint(pointer);
      });
      objectsToRemove.forEach((obj) => {
        if (!itemsToDelete.has(obj)) {
          obj.opacity = 0.3;
          itemsToDelete.add(obj);
        }
      });
      canvas.requestRenderAll();
    };

    const handleMouseUp = (event: any) => {
      const pointer = canvas.getPointer(event.e);
      if (!itemsToDelete.size) {
        const objectsToRemove = canvas.getObjects().filter((obj) => {
          return obj.containsPoint(pointer);
        });
        objectsToRemove.forEach((obj: fabric.Object) => {
          canvas.remove(obj);
        });
      }
      itemsToDelete.forEach((obj: fabric.Object) => {
        canvas.remove(obj);
      });
      itemsToDelete.clear();
      isMouseDown = false;
      configureCanvas(canvas);
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
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
