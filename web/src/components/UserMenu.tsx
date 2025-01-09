import { useEffect, useState, useRef } from "react";
import { Menu } from "lucide-react";
import useCanvasStore from "../store/canvasStore";

export default function UserMenu() {
    const fabricRef = useCanvasStore((state) => state.fabricRef);
    const [isOpen, setOpen] = useState<boolean>(false);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

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
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Open
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Save to...
                    </span>
                    <span
                        className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm"
                        onClick={exportImage}
                    >
                        Export image
                    </span>
                    <span className="w-full h-[1px] bg-border my-[3px]" />
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Toggle grid
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        View mode
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Shortcuts & help
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Reset the canvas
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Theme
                    </span>
                    <span className="w-full h-[1px] bg-border my-[3px]" />
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Terms of service
                    </span>
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        Privacy Policy
                    </span>
                    <span className="w-full h-[1px] bg-border my-[3px]" />
                    <span className="p-1 px-2 rounded-md cursor-pointer w-full min-w-24 hover:bg-slate-200 text-secondary-foreground text-sm">
                        About yapboard
                    </span>
                </div>
            ) : null}
        </>
    );
}
