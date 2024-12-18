import { cn } from "../lib/utils";
import useLogStore from "../store/logStore";

export default function Logger() {
  const logs = useLogStore((state) => state.logs);

  return (
    <div className="absolute flex flex-col overflow-auto bottom-2 right-2 max-h-[72px] log-container max-w-[350px] w-full">
      {logs.map((log, i) => {
        return (
          <span
            key={i}
            className={cn("text-gray-500 text-sm", {
              "text-red-400": log.type === "error",
            })}
          >
            {log.log}
          </span>
        );
      })}
    </div>
  );
}
