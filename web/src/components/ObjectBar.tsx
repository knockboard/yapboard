import { useEffect, useState } from "react";
import useCanvasStore from "../store/canvasStore";
import {
  ArrowDown10,
  ArrowUp10,
  Copy,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  Trash2,
  WandSparkles,
} from "lucide-react";
import * as fabric from "fabric";
import useLogStore from "../store/logStore";

export default function ObjectBar() {
  const { fabricRef } = useCanvasStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedObjectType, setSelectedObjectType] = useState<
    string | undefined
  >(undefined);
  const [selectedObjId, setSelectedObjId] = useState<number | undefined>(
    undefined
  );
  const [processingId, setProcessingId] = useState<number | undefined>(
    undefined
  );
  const [objectPos, setObjectPos] = useState<
    { x: number; y: number } | undefined
  >(undefined);
  const setLogs = useLogStore((state) => state.setLogs);

  const handleSelectionCleared = () => {
    setSelectedObjectType(undefined);
    setObjectPos(undefined);
  };

  const handleObjectMoving = (event: { target: any }) => {
    const obj = event.target;
    if (obj) {
      setObjectPos({ x: obj?.oCoords.tl.x, y: obj?.oCoords.tl.y });
    }
  };

  const handleDelete = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();

    if (activeObjects.length) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  };

  const handleFlipX = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      activeObject.flipX = !activeObject.flipX;
      canvas.requestRenderAll();
    }
  };

  const handleFlipY = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();

    if (activeObject) {
      activeObject.flipY = !activeObject.flipY;
      canvas.requestRenderAll();
    }
  };

  const cloneObject = async () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length === 0) return;

    if (activeObjects.length === 1) {
      const original = activeObjects[0];
      const clone = await original.clone();
      clone.left = original.left + 50;
      clone.top = original.top + 50;
      canvas.add(clone);
      canvas.setActiveObject(clone);
      canvas.renderAll();
      setLogs("1 item cloned.", "info");
      return;
    }

    const clones:
      | fabric.FabricObject<
          Partial<fabric.FabricObjectProps>,
          fabric.SerializedObjectProps,
          fabric.ObjectEvents
        >[]
      | undefined = [];
    activeObjects.forEach(async (obj) => {
      const clone = await obj.clone();
      clone.left = obj.left + 50;
      clone.top = obj.top + 50;
      canvas.add(clone);
      clones.push(clone);
    });

    setLogs(`${activeObjects.length} item cloned.`, "info");
    canvas.discardActiveObject();
    const clonedSelection = new fabric.ActiveSelection(clones, { canvas });
    canvas.setActiveObject(clonedSelection);
  };

  const download = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;

    const image = new Image();
    image.src = activeObject.toDataURL();

    const link = document.createElement("a");
    link.href = image.src;
    link.download = "yapboard_image.png";
    link.click();
  };

  const shiftDownLayer = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects.length) return;

    activeObjects.forEach((obj) => {
      canvas.sendObjectToBack(obj);
    });
  };

  const shiftUpLayer = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects.length) return;

    activeObjects.forEach((obj) => {
      canvas.bringObjectToFront(obj);
    });
  };

  const handleSelection = () => {
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 1) {
      const obj = activeObjects[0];
      // @ts-ignore
      setSelectedObjId(obj?.id || undefined);
      setSelectedObjectType(obj.type);
      setObjectPos({ x: obj.oCoords.tl.x, y: obj.oCoords.tl.y });
    } else if (activeObjects.length > 1) {
      const topmostPos = activeObjects.reduce(
        (acc, obj) => {
          const objPos = obj.oCoords.tl;
          return objPos.y < acc.y || (objPos.y === acc.y && objPos.x < acc.x)
            ? { x: objPos.x, y: objPos.y }
            : acc;
        },
        { x: Infinity, y: Infinity }
      );
      setSelectedObjectType(undefined);
      setObjectPos(topmostPos);
    }
  };

  const processImage = async () => {
    setLoading(true);
    setProcessingId(selectedObjId);
    const canvas = fabricRef?.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== "image") {
      setLogs("No image selected or invalid object type", "error");
      setLoading(false);
      setProcessingId(undefined);
      return;
    }

    const imageElement = activeObject.toDataURL();
    const res = await fetch(imageElement);
    const blob = await res.blob();

    const image = new Image();
    image.src = URL.createObjectURL(blob);
    image.onload = () => {
      setLogs(
        `Processing image: ${image.width}x${image.height} pixels`,
        "info"
      );
    };
    const file = new File([blob], "image.png", { type: "image/png" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-image/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setLogs(`${error.detail}`, "error");
        setLoading(false);
        setProcessingId(undefined);
        return;
      }

      const blob = await response.blob();
      const processedImageUrl = URL.createObjectURL(blob);

      canvas.remove(activeObject);

      fabric.Image.fromURL(processedImageUrl).then((img) => {
        img.set({
          left: activeObject.left,
          top: activeObject.top,
          angle: activeObject.angle,
        });
        img.type = "image";

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        setLogs(
          `Successfully processed image: ${image.width}x${image.height} pixels`,
          "info"
        );
      });
      setLoading(false);
      setProcessingId(undefined);
    } catch (error) {
      setLoading(false);
      setProcessingId(undefined);
      setLogs(`${error}`, "error");
    }
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelectionCleared);
    canvas.on("object:moving", handleObjectMoving);
    canvas.on("object:scaling", handleObjectMoving);

    return () => {
      canvas.off("selection:created", handleSelection);
      canvas.off("selection:updated", handleSelection);
      canvas.off("selection:cleared", handleSelectionCleared);
      canvas.off("object:moving", handleObjectMoving);
      canvas.off("object:scaling", handleObjectMoving);
    };
  }, [fabricRef, selectedObjectType]);

  const offset = 90;

  if (loading && selectedObjId && selectedObjId === processingId) {
    return (
      <div
        className="absolute toolbar-shadow"
        style={
          objectPos && {
            top: objectPos.y - offset + "px",
            left: objectPos.x + "px",
          }
        }
      >
        <div className="flex gap-2 px-2 bg-[#1e1e1e] rounded h-10 items-center">
          <span className="text-center text-secondary">
            Processing Image...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute toolbar-shadow"
      style={
        objectPos && {
          top: objectPos.y - offset + "px",
          left: objectPos.x + "px",
        }
      }
    >
      <div className="flex gap-2 p-1 bg-[#1e1e1e] rounded">
        {selectedObjectType === "image" ? (
          <div
            className="p-1 rounded cursor-pointer hover:bg-gray-700"
            title="Remove Background"
          >
            <WandSparkles
              size={24}
              strokeWidth={1}
              color="#fff"
              onClick={processImage}
            />
          </div>
        ) : null}
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          title="Duplicate"
        >
          <Copy size={24} strokeWidth={1} color="#fff" onClick={cloneObject} />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          title="Layer Down"
        >
          <ArrowDown10
            size={24}
            strokeWidth={1}
            color="#fff"
            onClick={shiftDownLayer}
          />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          title="Layer Up"
        >
          <ArrowUp10
            size={24}
            strokeWidth={1}
            color="#fff"
            onClick={shiftUpLayer}
          />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          onClick={handleFlipX}
          title="Flip X"
        >
          <FlipHorizontal2 size={24} strokeWidth={1} color="#fff" />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          onClick={handleFlipY}
          title="Flip Y"
        >
          <FlipVertical2 size={24} strokeWidth={1} color="#fff" />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          title="Download"
        >
          <Download size={24} strokeWidth={1} color="#fff" onClick={download} />
        </div>
        <div
          className="p-1 rounded cursor-pointer hover:bg-gray-700"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 size={24} strokeWidth={1} color="#fff" />
        </div>
      </div>
    </div>
  );
}
