import { Hand, MousePointer2, Plus } from "lucide-react";
import useToolStore from "../store/toolStore";
import { cn } from "../lib/utils";
import useCanvasStore from "../store/canvasStore";
import Pencil from "./Tools/Pencil";
import Rectangle from "./Tools/Rectangle";
import Circle from "./Tools/Circle";
import Triangle from "./Tools/Triangle";
import Line from "./Tools/Line";
import ColorPallete from "./ColorPallete";
import Image from "./Tools/Image";
import Text from "./Tools/Text";
import Stamp from "./Tools/Stamp";
import Eraser from "./Tools/Eraser";

export default function ToolBar() {
  const toolSelected = useToolStore((state) => state.toolSelected);
  const toolType = useToolStore((state) => state.type);
  const setTool = useToolStore((state) => state.setTool);
  const { fabricRef } = useCanvasStore();

  const togglePanMode = (): void => {
    if (!fabricRef.current) return;
    const newPanMode = toolSelected !== "hand";
    fabricRef.current.selection = !newPanMode;
    fabricRef.current.panMode = newPanMode;
  };

  return (
    <>
      <div className="absolute flex bg-background border border-border  rounded-lg bottom-2 left-1/2 -translate-x-1/2 h-[78px] z-20">
        <div className="overflow-hidden border-r rounded-tl-lg rounded-bl-lg border-border">
          <div
            className={cn("p-2 text-black", {
              "bg-primary text-white": toolSelected === "cursor",
              "hover:bg-gray-100": toolSelected !== "cursor",
            })}
            onClick={() => {
              setTool("cursor", undefined);
              if (!fabricRef.current) return;
              fabricRef.current.defaultCursor = "default";
            }}
          >
            <MousePointer2 size={22} strokeWidth={1} />
          </div>
          <div
            className={cn("p-2 text-dark ", {
              "bg-[#9747ff] text-white": toolSelected === "hand",
              "hover:bg-gray-100": toolSelected !== "hand",
            })}
            onClick={() => {
              setTool("hand", undefined);
              togglePanMode();
              if (!fabricRef.current) return;
              fabricRef.current.defaultCursor = "move";
            }}
          >
            <Hand size={22} strokeWidth={1} />
          </div>
        </div>

        <div className="flex gap-0 border-r border-border">
          <Pencil />
          <Eraser />

          <div
            className={cn("px-1 transition-all hover:bg-gray-100 group w-fit", {
              "bg-gray-100": toolType === "shape",
            })}
          >
            <div
              className={
                "overflow-hidden transition-all group-hover:-translate-y-4 h-[76px] group-hover:h-[83px]"
              }
            >
              <div className="grid w-24 grid-cols-2 translate-y-3 group-hover:translate-y-0">
                <Rectangle />
                <Circle />
                <Triangle />
                <Line />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-full gap-3 px-4 border-r border-border">
          <Text />
          <Stamp />
          <Image />
        </div>

        <div className="flex items-center justify-center h-full gap-3 px-4">
          <div className="p-1 overflow-hidden border rounded-md border-border hover:bg-gray-100">
            <Plus size={34} strokeWidth={1} />
          </div>
        </div>
      </div>
      <ColorPallete />
    </>
  );
}
