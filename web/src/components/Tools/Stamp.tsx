import { Stamp } from "lucide-react";
import useToolStore from "../../store/toolStore";
import { cn } from "../../lib/utils";

export default function StampTool() {
  const setTool = useToolStore((state) => state.setTool);
  const toolSelected = useToolStore((state) => state.toolSelected);
  const stampSelected = useToolStore((state) => state.stampSelected);
  const setStamp = useToolStore((state) => state.setStamp);

  return (
    <div
      className={cn(
        "relative p-1 overflow-hidden border rounded-md border-border",
        {
          "bg-primary": toolSelected === "stamp",
          "hover:bg-gray-100": toolSelected !== "stamp",
        }
      )}
    >
      <Stamp
        size={34}
        strokeWidth={1}
        color={toolSelected === "stamp" ? "#fff" : "#000"}
        onClick={() => {
          if (toolSelected === "stamp" && !stampSelected) {
            setTool("cursor", undefined);
          } else {
            setTool("stamp", undefined);
            setStamp(undefined);
          }
        }}
      />
    </div>
  );
}
