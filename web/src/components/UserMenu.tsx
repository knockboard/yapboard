import { Menu, User } from "lucide-react";
import useUserStore from "../store/userStore";
import { useState } from "react";
import useCanvasStore from "../store/canvasStore";

export default function UserMenu() {
  const fabricRef = useCanvasStore((state) => state.fabricRef);
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  const [isOpen, setOpen] = useState<boolean>(false);

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

  return (
    <>
      <div
        className="absolute z-50 flex items-center gap-1 pr-2 bg-gray-200 rounded-full cursor-pointer top-8 left-8"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-primary">
          <span className="font-medium text-gray-100 dark:text-gray-300">
            {user.username[0]}
          </span>
        </div>
        <Menu />
      </div>

      {isOpen ? (
        <div className="absolute flex flex-col p-2 rounded-md left-9 top-[78px] bg-secondary dropdown-shadow z-50">
          <span className="flex items-center gap-2 p-1 border-b-2 rounded-md cursor-pointer min-w-24 text-secondary-foreground">
            <User size={18} />
            {user.username}
          </span>
          <span
            className="p-1 rounded-md cursor-pointer min-w-24 hover:bg-slate-200 text-secondary-foreground"
            onClick={exportImage}
          >
            Export image
          </span>
          <span
            className="p-1 rounded-md cursor-pointer min-w-24 hover:bg-slate-200 text-secondary-foreground"
            onClick={clearUser}
          >
            Logout
          </span>
        </div>
      ) : null}

      {isOpen ? (
        <div
          className="absolute top-0 left-0 z-40 w-screen h-screen bg-black opacity-10"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
