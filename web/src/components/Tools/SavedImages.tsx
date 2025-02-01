import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import * as fabric from "fabric";
import useUserStore from "../../store/userStore";
import useCanvasStore from "../../store/canvasStore";
import useToolStore from "../../store/toolStore";

export default function SavedImages() {
  const [images, setImages] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { fabricRef } = useCanvasStore();
  const setTool = useToolStore((state) => state.setTool);
  const user = useUserStore((state) => state.user);
  const imagesRef = useRef<HTMLDivElement>(null);

  const fetchImages = async () => {
    const res = await fetch("/api/current-user/images", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setImages(data);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        imagesRef.current &&
        !imagesRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".plus-button")
      ) {
        setIsOpen(false);
        setTool("cursor", undefined);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setTool]);

  return (
    <>
      {isOpen && (
        <div
          ref={imagesRef}
          className="absolute z-10 grid grid-cols-3 gap-2 p-2 -translate-x-1/2 bg-white border rounded-md shadow-lg bottom-20 left-1/2 border-border max-w-96 max-h-80 overflow-y-auto"
        >
          {images.length ? (
            images.map((img, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-md flex items-center justify-center bg-gray-100"
              >
                <img
                  src={`/images/${img}`}
                  alt="yapboard"
                  className="w-full h-full object-contain cursor-pointer hover:opacity-80"
                  onClick={() => {
                    const canvas = fabricRef?.current;
                    if (!canvas) return;

                    const defaultX = 100;
                    const defaultY = 100;

                    fabric.Image.fromURL(`/images/${img}`).then((img) => {
                      img.set({
                        left: defaultX,
                        top: defaultY,
                        scaleX: 0.5,
                        scaleY: 0.5,
                      });

                      canvas.add(img);
                      canvas.requestRenderAll();
                    });
                    setIsOpen(false);
                    setTool("cursor", undefined);
                  }}
                />
              </div>
            ))
          ) : (
            <span className="w-full whitespace-nowrap text-muted-foreground">
              No images saved. Start creating!
            </span>
          )}
        </div>
      )}

      <div
        className="p-1 overflow-hidden border rounded-md cursor-pointer border-border hover:bg-gray-100 plus-button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTool("saved-images", undefined);
        }}
      >
        <Plus size={34} strokeWidth={1} />
      </div>
    </>
  );
}
