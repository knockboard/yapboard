import { useEffect, useState, useRef } from "react";
import { Menu } from "lucide-react";
import * as fabric from "fabric";
import useCanvasStore from "../store/canvasStore";
import useLogStore from "../store/logStore";
import useUserStore from "../store/userStore";

export default function UserMenu() {
  const fabricRef = useCanvasStore((state) => state.fabricRef);
  const setLogs = useLogStore((state) => state.setLogs);
  const [isOpen, setOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const clearUser = useUserStore((state) => state.clearUser);

  const exportImage = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const img = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = img;
    link.download = "yapbaord-image.png";
    link.click();

    setOpen(false);
  };

  const resetCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;

    canvas.getObjects().forEach((obj) => canvas.remove(obj));
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
    });
    setLogs(`Canvas state reset.`, "info");
    setOpen(false);
  };

  useEffect(() => {
    const handleMenu = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        menuButtonRef &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("click", handleMenu);
    } else {
      window.removeEventListener("click", handleMenu);
    }

    return () => {
      window.removeEventListener("click", handleMenu);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={menuButtonRef}
        className="absolute z-50 flex items-center gap-1 p-1 bg-gray-200 rounded-md cursor-pointer top-2 left-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Menu className="text-gray-600" />
      </button>

      {isOpen ? (
        <div
          className="absolute flex flex-col p-2 rounded-md left-2 top-12 border-2 bg-white z-50 min-w-24"
          ref={menuRef}
        >
          {/* <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Open
          </span>
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Save to...
          </span> */}
          <span
            className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm"
            onClick={exportImage}
          >
            Export image
          </span>
          {/* <span className="w-full h-[1px] bg-border my-[3px]" />
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Toggle grid
          </span>
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            View mode
          </span>
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Shortcuts & help
          </span> */}
          <span
            onClick={resetCanvas}
            className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm"
          >
            Reset the canvas
          </span>
          {/* <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Theme
          </span> */}
          <span className="w-full h-[1px] bg-border my-[3px]" />
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Terms of service
          </span>
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            Privacy Policy
          </span>
          <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
            About yapboard
          </span>
          <span className="w-full h-[1px] bg-border my-[3px]" />
          <span
            className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm"
            onClick={() => {
              clearUser();
              window.location.href = "/";
            }}
          >
            Logout
          </span>
        </div>
      ) : null}
    </>
  );
}
