import { useEffect, useRef } from "react";

export default function FpsStat() {
  const fpsGraphRef = useRef<HTMLCanvasElement>(null);
  const fpsData: number[] = [];
  let lastTime = performance.now();
  let frameCount = 0;
  let reqId: number;

  const bg = "#21351a";
  const fg = "#6edc21";
  const graph_bg = "#28481b";

  const PR = Math.round(window.devicePixelRatio || 1);
  const WIDTH = 100 * PR;
  const HEIGHT = 60 * PR;
  const GRAPH_X = 0;
  const GRAPH_Y = 20 * PR;
  const GRAPH_WIDTH = WIDTH;
  const GRAPH_HEIGHT = HEIGHT - 20 * PR;

  useEffect(() => {
    const canvas = fpsGraphRef.current;
    if (!canvas) return;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.width = `${WIDTH / PR}px`;
    canvas.style.height = `${HEIGHT / PR}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = graph_bg;
    ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

    function drawGraph() {
      if (!ctx) return;

      ctx.fillStyle = graph_bg;
      ctx.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

      fpsData.forEach((value, index) => {
        const barHeight = Math.min(value, GRAPH_HEIGHT) / 1.5;
        const x = GRAPH_WIDTH - (fpsData.length - index) * 4 * PR;
        const y = GRAPH_Y + GRAPH_HEIGHT - barHeight;

        ctx.fillStyle = fg;
        ctx.fillRect(x, y, 4 * PR, barHeight);
      });
    }

    function updateFPS() {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);
        frameCount = 0;
        lastTime = currentTime;

        fpsData.push(fps);
        if (fpsData.length > 26) {
          fpsData.shift();
        }

        drawGraph();

        if (!ctx) return;

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 100 * PR, 20 * PR);
        ctx.fillStyle = fg;
        ctx.font = `bold ${12 * PR}px Helvetica, Arial, sans-serif`;
        ctx.fillText(`${fps.toFixed(2)} FPS`, 10 * PR, 15 * PR);
      }

      reqId = requestAnimationFrame(updateFPS);
    }

    reqId = requestAnimationFrame(updateFPS);

    return () => {
      cancelAnimationFrame(reqId);
    };
  }, []);

  return (
    <div className="absolute top-2 right-2 h-[80px] w-[100px]">
      <canvas ref={fpsGraphRef} />
    </div>
  );
}
