import { Type } from "lucide-react";
import useCanvasStore from "../../store/canvasStore";
import useToolStore from "../../store/toolStore";
import * as fabric from "fabric";
import { useCallback, useEffect } from "react";
import { cn } from "../../lib/utils";

export default function Text() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const selectedColor = useToolStore((state) => state.color);
  const fontFamily = useToolStore((state) => state.fontFamily);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "text") return;

    const addText = (event: { e: fabric.TPointerEvent }) => {
      const canvas = fabricRef?.current;
      if (!canvas) return;

      const pointer = canvas.getPointer(event.e as MouseEvent);

      const text = new fabric.IText("", {
        fill: selectedColor,
        top: pointer.y,
        left: pointer.x,
        width: 180,
        fontFamily: fontFamily,
        editable: true,
      });

      setTool("cursor", undefined);
      canvas.defaultCursor = "default";
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.requestRenderAll();
      text.enterEditing();
    };

    canvas.on("mouse:down", addText);

    return () => {
      canvas.off("mouse:down", addText);
    };
  }, [toolSelected, fabricRef, fontFamily, selectedColor]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents]);

  return (
    <div
      className={cn(
        "relative p-1 overflow-hidden border rounded-md border-border",
        {
          "bg-primary": toolSelected === "text",
          "hover:bg-gray-100": toolSelected !== "text",
        }
      )}
      onClick={() => {
        setTool("text", undefined);
        if (!fabricRef.current) return;
        fabricRef.current.defaultCursor = "text";
      }}
    >
      <Type
        size={34}
        strokeWidth={1}
        color={toolSelected === "text" ? "#fff" : "#000"}
      />
    </div>
  );
}
