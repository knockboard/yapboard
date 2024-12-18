import { Image } from "lucide-react";
import useCanvasStore from "../../store/canvasStore";
import * as fabric from "fabric";
import useLogStore from "../../store/logStore";
import { useState } from "react";

export default function ImageTool() {
  const { fabricRef } = useCanvasStore();
  const setLogs = useLogStore((state) => state.setLogs);
  const [key, setKey] = useState<number>(0);

  const handleFileChange = (e: any) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;

    const file = e.target.files[0];
    const image = URL.createObjectURL(file);

    fabric.Image.fromURL(image).then((img) => {
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
      canvas.setActiveObject(img);
      setLogs(`Image added of ${img.width}x${img.height}  pixels.`, "info");
    });
    setKey((prevKey: number) => prevKey + 1);
  };

  return (
    <div className="relative flex items-center justify-center p-2 border rounded-md cursor-pointer border-border hover:bg-gray-100">
      <Image size={27} strokeWidth={1} />
      <input
        key={key}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="image/*"
        aria-label="Upload image"
        onChange={handleFileChange}
      />
    </div>
  );
}
