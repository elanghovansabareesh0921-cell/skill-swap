"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface WhiteboardProps {
  channel: any;
  currentUserId: string;
}

interface DrawStroke {
  prevX: number;
  prevY: number;
  currX: number;
  currY: number;
  color: string;
  size: number;
}

export default function Whiteboard({ channel, currentUserId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2563eb"); // default blue
  const [brushSize, setBrushSize] = useState(3);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const drawLine = useCallback((stroke: DrawStroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(stroke.prevX, stroke.prevY);
    ctx.lineTo(stroke.currX, stroke.currY);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.closePath();
  }, []);

  const clearCanvas = (broadcast = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (broadcast && channel) {
      channel.send({
        type: "broadcast",
        event: "whiteboard-clear",
        payload: { senderId: currentUserId },
      });
    }
  };

  useEffect(() => {
    if (!channel) return;

    const sub = channel
      .on("broadcast", { event: "whiteboard-draw" }, (payload: any) => {
        if (payload.payload.senderId !== currentUserId) {
          drawLine(payload.payload.stroke);
        }
      })
      .on("broadcast", { event: "whiteboard-clear" }, (payload: any) => {
        if (payload.payload.senderId !== currentUserId) {
          clearCanvas(false);
        }
      });

    return () => {
      // Cleanup events when unmounted
    };
  }, [channel, currentUserId, drawLine]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    lastPosRef.current = coords;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;
    const coords = getCanvasCoordinates(e);

    const stroke: DrawStroke = {
      prevX: lastPosRef.current.x,
      prevY: lastPosRef.current.y,
      currX: coords.x,
      currY: coords.y,
      color,
      size: brushSize,
    };

    drawLine(stroke);

    if (channel) {
      channel.send({
        type: "broadcast",
        event: "whiteboard-draw",
        payload: { stroke, senderId: currentUserId },
      });
    }

    lastPosRef.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 p-2 shadow-2xl">
      {/* Canvas Tool Controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">🎨 Architecture Whiteboard</span>
          <div className="flex items-center gap-1.5 ml-2">
            {["#ffffff", "#2563eb", "#10b981", "#ef4444", "#f59e0b"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-5 h-5 rounded-full border ${
                  color === c ? "ring-2 ring-white scale-110" : "border-slate-700"
                } transition-transform`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="bg-slate-800 text-white text-xs rounded px-2 py-1 border border-slate-700 outline-none"
          >
            <option value={2}>Thin</option>
            <option value={4}>Medium</option>
            <option value={8}>Thick</option>
          </select>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => clearCanvas(true)}>
            Clear
          </Button>
        </div>
      </div>

      {/* Synchronized Canvas Surface */}
      <div className="flex-1 w-full bg-slate-950 rounded-lg overflow-hidden relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={1000}
          height={650}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full touch-none"
        />
      </div>
    </div>
  );
}