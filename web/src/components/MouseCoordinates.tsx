import { useEffect, useState } from "react";

export default function MouseCoordinates() {
  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
  }, []);

  return (
    <div className="absolute top-2 right-2">
      <span className="text-sm text-gray-500">
        x: {coords.x}, y: {coords.y}
      </span>
    </div>
  );
}
