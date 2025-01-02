import React, { useEffect, useMemo, useRef } from "react";
import * as fabric from "fabric";
import useCanvasStore from "../store/canvasStore";
import ZoomInOut from "./ZoomInOut";
import useToolStore from "../store/toolStore";
import useLogStore from "../store/logStore";
import useCanvasSize from "../hooks/useCanvasSize";

interface CustomFabricCanvas extends fabric.Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
  panMode?: boolean;
}

const Canvas: React.FC = () => {
  const { canvasRef, fabricRef, setCanvasRef, setFabricRef, setZoomLevel } =
    useCanvasStore();
  const toolSelected = useToolStore((state) => state.toolSelected);
  const toolType = useToolStore((state) => state.type);
  const fontFamily = useToolStore((state) => state.fontFamily);
  const isPanMode = useMemo(() => {
    if (toolSelected === "hand") return true;
    return false;
  }, [toolSelected]);
  const setLogs = useLogStore((state) => state.setLogs);
  const { width, height } = useCanvasSize();
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const MAX_STACK_SIZE = 50;
  const skipNextSaveToHistory = useRef(false);

  const saveState = (data: string) => {
    if (skipNextSaveToHistory.current) {
      skipNextSaveToHistory.current = false;
      return;
    }

    const canvas = fabricRef.current;
    if (!canvas) return;

    if (
      undoStack.current.length === 0 ||
      undoStack.current[undoStack.current.length - 1] !== data
    ) {
      undoStack.current.push(data);
      if (undoStack.current.length > MAX_STACK_SIZE) {
        undoStack.current.shift();
      }

      redoStack.current = [];
      setLogs("State saved to undo stack.", "info");
    }
  };

  const undo = async () => {
    const canvas = fabricRef.current;
    if (!canvas || undoStack.current.length <= 1) return;

    const currentState = undoStack.current.pop();
    if (!currentState) return;

    redoStack.current.push(currentState);

    if (redoStack.current.length > MAX_STACK_SIZE) {
      redoStack.current.shift();
    }

    const previousState = undoStack.current[undoStack.current.length - 1];

    try {
      skipNextSaveToHistory.current = true;
      await canvas.loadFromJSON(previousState);
      canvas.renderAll();
    } catch (error) {
      setLogs("Error performing undo.", "error");
      undoStack.current.push(currentState);
      redoStack.current.pop();
    }
  };

  const redo = async () => {
    const canvas = fabricRef.current;
    if (!canvas || redoStack.current.length === 0) return;

    const nextState = redoStack.current.pop();
    if (!nextState) return;

    undoStack.current.push(nextState);

    try {
      skipNextSaveToHistory.current = true;
      await canvas.loadFromJSON(nextState);
      canvas.renderAll();
    } catch (error) {
      setLogs("Error performing redo.", "error");
      redoStack.current.push(nextState);
      undoStack.current.pop();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: "#f9fafb",
      hoverCursor: "grab",
      moveCursor: "grabbing",
      selection: true,
      preserveObjectStacking: true,
    }) as CustomFabricCanvas;

    setFabricRef(canvas);

    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;

    const loadCanvasData = async () => {
      const jsonData = localStorage.getItem("yapboard");
      const parsedJson = jsonData && JSON.parse(jsonData);

      if (jsonData && parsedJson.objects.length) {
        try {
          await canvas.loadFromJSON(jsonData);
          setLogs("Canvas data loaded from localStorage.", "info");
        } catch (error) {
          setLogs("Failed to load canvas data from localStorage.", "error");
        }
      } else {
        const yapper = "/yapper.webp";
        fabric.Image.fromURL(yapper).then((img) => {
          img.set({
            dirty: true,
            scaleX: 0.5,
            scaleY: 0.5,
            left: centerX - (img.width! * 0.5) / 2,
            top: centerY - 350,
          });
          img.set({
            id: Math.floor(Math.random() * 100000000),
          });
          canvas.add(img);
          setLogs(`Image added of ${img.width}x${img.height}  pixels.`, "info");
        });

        const logo = "/wordart.png";
        fabric.Image.fromURL(logo).then((img) => {
          img.set({
            dirty: true,
            scaleX: 0.5,
            scaleY: 0.5,
            left: centerX - (img.width! * 0.5) / 2,
            top: centerY - 150,
          });
          img.set({
            id: Math.floor(Math.random() * 100000000),
          });
          canvas.add(img);
          setLogs(`Image added of ${img.width}x${img.height}  pixels.`, "info");
        });
      }
      canvas.renderAll();
    };

    loadCanvasData();

    return () => {
      canvas.dispose();
    };
  }, [canvasRef, height, width]);

  useEffect(() => {
    const handleDelete = (event: KeyboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (event.key !== "Delete") return;
      const activeObjects = canvas.getActiveObjects();

      if (activeObjects.length) {
        const isEditingTextbox = activeObjects.some((obj) => {
          // @ts-ignore
          return obj.type === "textbox" && obj?.isEditing;
        });

        if (isEditingTextbox) {
          return;
        }

        activeObjects.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };

    window.addEventListener("keydown", handleDelete);

    return () => {
      document.removeEventListener("keydown", handleDelete);
    };
  }, [toolSelected, fabricRef]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (isPanMode) {
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
      });
      canvas.renderAll();
    } else if (
      ["pencil", "text", "stamp"].includes(toolSelected) ||
      toolType === "shape"
    ) {
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.hoverCursor = toolSelected === "text" ? "text" : "crosshair";
      });
      canvas.renderAll();
    } else {
      canvas.selection = true;
      canvas.getObjects().forEach((obj) => {
        obj.selectable = true;
        obj.hoverCursor = "grab";
        obj.moveCursor = "grabbing";
      });
      canvas.renderAll();
    }
  }, [toolSelected, fabricRef, canvasRef, toolType, isPanMode]);

  const zoomByPoint = (
    point: { x: number; y: number },
    factor: number
  ): void => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const currentZoom = canvas.getZoom();
    const newZoom = currentZoom * factor;

    if (newZoom > 5 || newZoom < 0.2) return;

    const canvasElement = canvas.getElement();
    const rect = canvasElement.getBoundingClientRect();

    const x = point.x - rect.left;
    const y = point.y - rect.top;

    const fabricPoint = new fabric.Point(x, y);
    canvas.zoomToPoint(fabricPoint, newZoom);

    setZoomLevel(Math.round(newZoom * 100));
  };

  const handleMouseWheel = (event: React.WheelEvent): void => {
    if (event.ctrlKey) {
      event.preventDefault();
      const point = {
        x: event.clientX,
        y: event.clientY,
      };
      const factor = event.deltaY < 0 ? 1.1 : 0.9;
      zoomByPoint(point, factor);
    }
  };

  useEffect(() => {
    const preventCtrlScroll = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventCtrlScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", preventCtrlScroll);
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent): void => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (isPanMode || event.ctrlKey) {
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
      });
      canvas.renderAll();

      canvas.isDragging = true;
      canvas.lastPosX = event.clientX;
      canvas.lastPosY = event.clientY;
      canvas.selection = false;
    }
  };

  const handleMouseMove = (event: React.MouseEvent): void => {
    const canvas = fabricRef.current;
    if (!canvas?.isDragging) return;

    const vpt = canvas.viewportTransform;
    if (!vpt) return;

    vpt[4] += event.clientX - (canvas.lastPosX || 0);
    vpt[5] += event.clientY - (canvas.lastPosY || 0);

    canvas.requestRenderAll();
    canvas.lastPosX = event.clientX;
    canvas.lastPosY = event.clientY;
  };

  const handleMouseUp = (): void => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDragging = false;
    canvas.selection = !isPanMode;
    canvas.selection = true;
    canvas.getObjects().forEach((obj) => {
      obj.selectable = true;
      obj.hoverCursor = "grab";
      obj.moveCursor = "grabbing";
    });
    canvas.renderAll();
  };

  useEffect(() => {
    const handleCopy = async (_: ClipboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const selectedObjects = canvas.getActiveObjects();
      const json = JSON.stringify(selectedObjects);
      window.navigator.clipboard.writeText(json);
    };

    const handlePaste = async (event: ClipboardEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) return;

      for (const item of clipboardItems) {
        if (item.type === "text/plain") {
          const data = event.clipboardData?.getData("Text");
          if (data) {
            const textbox = new fabric.Textbox(data, {
              left: canvas.width! / 2,
              top: canvas.height! / 2,
              width: 300,
              fontSize: 20,
              fontFamily: fontFamily,
              fill: "#333",
              editable: true,
            });
            canvas.add(textbox);
            canvas.setActiveObject(textbox);
            canvas.requestRenderAll();
            setLogs(`Text pasted.`, "info");
          }
        }

        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          const image = URL.createObjectURL(blob!);

          fabric.Image.fromURL(image).then((img) => {
            img.set({
              dirty: true,
              scaleX: 0.5,
              scaleY: 0.5,
              left: canvas.width! / 2,
              top: canvas.height! / 2,
            });
            img.set({
              id: Math.floor(Math.random() * 100000000),
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            setLogs(
              `Image pasted of ${img.width}x${img.height}  pixels.`,
              "info"
            );
          });
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    // window.addEventListener("copy", handleCopy);

    return () => {
      window.removeEventListener("paste", handlePaste);
      // window.removeEventListener("copy", handleCopy);
    };
  }, [fabricRef, fontFamily]);

  useEffect(() => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const convertBlobToDataURL = (blob: Blob): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    const saveToLocalStorage = async () => {
      const canvasObjects = canvas.getObjects();

      await Promise.all(
        canvasObjects.map(async (obj) => {
          if (
            obj.type === "image" &&
            obj instanceof fabric.Image &&
            obj._element &&
            obj._element instanceof HTMLImageElement &&
            obj._element.src.startsWith("blob:")
          ) {
            try {
              const response = await fetch(obj._element.src);
              const blob = await response.blob();
              const base64DataUrl = await convertBlobToDataURL(blob);

              obj._element.src = base64DataUrl;
              obj.set({ src: base64DataUrl });
            } catch (error) {
              setLogs("Failed to save image", "error");
            }
          }
          return obj;
        })
      );

      const jsonData = JSON.stringify(canvas.toJSON());
      localStorage.setItem("yapboard", jsonData);
      saveState(jsonData);
    };

    canvas.on("object:added", saveToLocalStorage);
    canvas.on("object:modified", saveToLocalStorage);
    canvas.on("object:removed", saveToLocalStorage);

    return () => {
      canvas.off("object:added", saveToLocalStorage);
      canvas.off("object:modified", saveToLocalStorage);
      canvas.off("object:removed", saveToLocalStorage);
    };
  }, [fabricRef]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "z") {
        undo();
      } else if (event.ctrlKey && event.key === "y") {
        redo();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [fabricRef]);

  return (
    <div className="flex flex-col items-center h-screen w-screen gap-4 overflow-hidden">
      <div
        className="relative w-screen h-screen overflow-hidden border border-gray-300 rounded-lg"
        onWheel={handleMouseWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas id="canvas" className="w-screen h-screen" ref={setCanvasRef} />
      </div>

      <ZoomInOut zoomByPoint={zoomByPoint} />
    </div>
  );
};

export default Canvas;
