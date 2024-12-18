import { useCallback, useEffect } from "react";
import useCanvasStore from "../store/canvasStore";
import useToolStore from "../store/toolStore";
import * as fabric from "fabric";

const stamps = [
  {
    lable: "heart",
    path: "/heart.png",
  },
  {
    lable: "question",
    path: "/question.png",
  },
  {
    lable: "1",
    path: "/1.png",
  },
  {
    lable: "heart",
    path: "/heart.png",
  },
  {
    lable: "question",
    path: "/question.png",
  },
  {
    lable: "1",
    path: "/1.png",
  },
];

export default function StampsBar() {
  const { fabricRef } = useCanvasStore();
  const toolSelected = useToolStore((state) => state.toolSelected);
  const stampSelected = useToolStore((state) => state.stampSelected);
  const setStamp = useToolStore((state) => state.setStamp);

  const initializeCanvasEvents = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || toolSelected !== "stamp") return;

    const addStamp = (event: { e: fabric.TPointerEvent }) => {
      const canvas = fabricRef?.current;
      if (!canvas) return;

      if (!stampSelected) return;

      const pointer = canvas.getPointer(event.e as MouseEvent);

      fabric.Image.fromURL(stampSelected).then((img) => {
        img.set({
          dirty: true,
          scaleX: 0.5,
          scaleY: 0.5,
          left: pointer.x,
          top: pointer.y,
          selectable: false,
        });
        img.type = "image";
        canvas.add(img);
      });

      canvas.defaultCursor = "default";
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    };

    canvas.on("mouse:down", addStamp);

    return () => {
      canvas.off("mouse:down", addStamp);
    };
  }, [toolSelected, fabricRef, stampSelected]);

  useEffect(() => {
    const cleanup = initializeCanvasEvents();
    return cleanup;
  }, [toolSelected, fabricRef, initializeCanvasEvents, stampSelected]);

  if (toolSelected !== "stamp" || stampSelected) return null;

  return (
    <div className="absolute z-10 flex items-center p-2 pb-3 -translate-x-1/2 border rounded-md bg-secondary bottom-20 left-1/2 border-border toolbar-shadow">
      {stamps.map((stamp, i) => {
        return (
          <div
            key={i}
            className="rounded-full p-[2px] border border-secondary w-10 h-10 hover:bg-[#dfd4fe] cursor-pointer"
            onClick={() => {
              if (toolSelected === "stamp") {
                setStamp(stamp.path);
              }
            }}
          >
            <img src={stamp.path} className="w-full h-full rounded-full" />
          </div>
        );
      })}
    </div>
  );
}
