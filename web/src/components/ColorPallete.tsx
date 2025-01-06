import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import useCanvasStore from "../store/canvasStore";
import useToolStore from "../store/toolStore";
import FontFamilyDropdown from "./FontFamilyDropdown";

const colors = [
  "#000000",
  "#b3b3b3",
  "#fdd100",
  "#aff4c6",
  "#ffc7c2",
  "#e4ccff",
  "#9747ff",
];

export default function ColorPallete() {
  const { fabricRef } = useCanvasStore();
  const toolSelected = useToolStore((state) => state.toolSelected);
  const toolType = useToolStore((state) => state.type);
  const setStroke = useToolStore((state) => state.setStroke);
  const setColor = useToolStore((state) => state.setColor);
  const selectedColor = useToolStore((state) => state.color);
  const selectedStroke = useToolStore((state) => state.stroke);
  const [isMultipleSelected, setIsMultipleSelected] = useState<boolean>(false);
  const [selectedObjectType, setSelectedObjectType] = useState<
    string | undefined
  >(undefined);
  const [toggleFontDropdown, setToggleFontDropdown] = useState<boolean>(false);
  const selectedFontFamily = useToolStore((state) => state.fontFamily);

  const changeObjectColor = (color: string) => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length) {
      activeObjects.forEach((obj) => {
        if (obj.type === "path") {
          obj.set({ stroke: color });
        } else if (obj.type === "line") {
          obj.set({ stroke: color });
        } else {
          obj.set({ fill: color });
        }
        canvas.requestRenderAll();
      });
    }
  };

  useEffect(() => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const handleSelection = () => {
      const activeObjects = canvas.getActiveObjects();
      if (!activeObjects.length) {
        setIsMultipleSelected(false);
        setSelectedObjectType(undefined);
      }

      if (activeObjects.length > 1) {
        activeObjects.forEach((obj) => {
          if (obj.type !== "image") {
            setIsMultipleSelected(true);
            return;
          } else {
            setIsMultipleSelected(false);
          }
        });
      } else {
        setSelectedObjectType(activeObjects[0].type);
      }
    };

    const handleSelectionClear = () => {
      setIsMultipleSelected(false);
      setSelectedObjectType(undefined);
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelectionClear);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelectionClear);
    };
  }, [fabricRef, selectedObjectType, isMultipleSelected]);

  if (
    !(
      ["pencil", "text"].includes(toolSelected) ||
      toolType === "shape" ||
      (selectedObjectType &&
        [
          "rect",
          "ellipse",
          "textbox",
          "line",
          "path",
          "triangle",
          "i-text",
        ].includes(selectedObjectType))
    ) &&
    !isMultipleSelected
  )
    return null;

  return (
    <div className="absolute z-10 flex items-center px-2 pt-2 pb-3 -translate-x-1/2 border rounded-md bg-secondary bottom-20 left-1/2 border-border toolbar-shadow">
      {["textbox", "i-text"].includes(String(selectedObjectType)) ||
      toolSelected === "text" ? (
        <div className="relative flex w-full gap-1 border-r-2">
          <span
            onClick={() => setToggleFontDropdown((prev) => !prev)}
            className="w-full h-full px-2 py-[2px] mr-2 rounded-md cursor-pointer hover:bg-gray-200"
            style={{
              fontFamily: selectedFontFamily,
            }}
          >
            Aa
          </span>
          {toggleFontDropdown ? (
            <div className="absolute -translate-x-1/2 left-1/2 bottom-10">
              <FontFamilyDropdown
                toggleDropdown={() => setToggleFontDropdown((prev) => !prev)}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      {toolSelected === "pencil" || toolSelected === "line" ? (
        <div className="relative flex items-center w-full h-full gap-1 border-r-2">
          <div
            onClick={() => setStroke(4)}
            className={`w-6 h-6 rounded-md cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
              selectedStroke === 4 ? "bg-gray-200" : ""
            }`}
          >
            <div className="w-2 h-2 bg-gray-600 rounded-full" />
          </div>
          <div
            onClick={() => setStroke(8)}
            className={`w-6 h-6 mr-2 rounded-md cursor-pointer hover:bg-gray-200 flex items-center justify-center ${
              selectedStroke === 8 ? "bg-gray-200" : ""
            }`}
          >
            <div className="w-3 h-3 bg-gray-600 rounded-full" />
          </div>
        </div>
      ) : null}
      <div className="flex w-full gap-1 px-2 border-r-2">
        {colors.map((c, i) => (
          <div
            key={i}
            className={cn("rounded-full p-[2px] border border-secondary", {
              "border-primary": selectedColor === c,
            })}
          >
            <div
              className={cn(`h-6 w-6 rounded-full`)}
              style={{
                background: c,
              }}
              onClick={() => {
                setColor(c);
                changeObjectColor(c);
              }}
            />
          </div>
        ))}
      </div>
      <div
        className={cn("rounded-full p-[2px] border border-secondary ml-2", {
          "border-primary": !colors.includes(selectedColor),
        })}
      >
        <div
          className={cn(`rounded-full relative overflow-hidden h-6 w-6`)}
          style={
            colors.includes(selectedColor)
              ? {
                  background: "url('/color-picker.ico')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: selectedColor,
                }
          }
        >
          <input
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              setColor(e.target.value);
              changeObjectColor(e.target.value);
            }}
            type="color"
          />
        </div>
      </div>
    </div>
  );
}
