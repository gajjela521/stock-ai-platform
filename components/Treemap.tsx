"use client";

import { TreemapRect, TreemapStock, getStockColor } from "@/lib/marketOverview";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TreemapProps {
    rects: TreemapRect[];
}

export function Treemap({ rects }: TreemapProps) {
    const router = useRouter();
    const [hoveredStock, setHoveredStock] = useState<TreemapStock | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleClick = (symbol: string) => {
        router.push(`/analysis?symbol=${symbol}`);
    };

    const handleMouseMove = (e: React.MouseEvent, stock: TreemapStock) => {
        setHoveredStock(stock);
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="relative w-full h-full">
            <svg width="100%" height="100%" className="cursor-pointer">
                {rects.map((rect, index) => {
                    const color = getStockColor(rect.stock.changePercent);
                    const isHovered = hoveredStock?.symbol === rect.stock.symbol;

                    return (
                        <g key={rect.stock.symbol + index}>
                            <rect
                                x={rect.x}
                                y={rect.y}
                                width={rect.width}
                                height={rect.height}
                                fill={color}
                                stroke="white"
                                strokeWidth={isHovered ? 3 : 1}
                                opacity={isHovered ? 1 : 0.9}
                                onClick={() => handleClick(rect.stock.symbol)}
                                onMouseEnter={(e) => handleMouseMove(e, rect.stock)}
                                onMouseMove={(e) => handleMouseMove(e, rect.stock)}
                                onMouseLeave={() => setHoveredStock(null)}
                                className="transition-all duration-200 hover:opacity-100"
                            />
                            {/* Show symbol if rect is large enough */}
                            {rect.width > 60 && rect.height > 40 && (
                                <>
                                    <text
                                        x={rect.x + rect.width / 2}
                                        y={rect.y + rect.height / 2 - 8}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize={Math.min(rect.width / 6, rect.height / 4, 16)}
                                        fontWeight="bold"
                                        pointerEvents="none"
                                        className="select-none"
                                    >
                                        {rect.stock.symbol}
                                    </text>
                                    <text
                                        x={rect.x + rect.width / 2}
                                        y={rect.y + rect.height / 2 + 10}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize={Math.min(rect.width / 8, rect.height / 6, 12)}
                                        pointerEvents="none"
                                        className="select-none"
                                    >
                                        {rect.stock.changePercent > 0 ? "+" : ""}
                                        {rect.stock.changePercent.toFixed(2)}%
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredStock && (
                <div
                    className="fixed z-50 bg-neutral-900 text-white px-4 py-3 rounded-lg shadow-xl border border-neutral-700 pointer-events-none"
                    style={{
                        left: mousePos.x + 15,
                        top: mousePos.y + 15,
                    }}
                >
                    <div className="font-bold text-lg">{hoveredStock.symbol}</div>
                    <div className="text-sm text-neutral-300">{hoveredStock.name}</div>
                    <div className="text-sm mt-1">
                        <span className="text-neutral-400">Price:</span> ${hoveredStock.price.toFixed(2)}
                    </div>
                    <div className="text-sm">
                        <span className="text-neutral-400">Change:</span>{" "}
                        <span className={hoveredStock.changePercent >= 0 ? "text-green-400" : "text-red-400"}>
                            {hoveredStock.changePercent > 0 ? "+" : ""}
                            {hoveredStock.changePercent.toFixed(2)}%
                        </span>
                    </div>
                    <div className="text-sm">
                        <span className="text-neutral-400">Market Cap:</span> $
                        {(hoveredStock.marketCap / 1e9).toFixed(2)}B
                    </div>
                    {hoveredStock.sector && (
                        <div className="text-xs text-neutral-400 mt-1">{hoveredStock.sector}</div>
                    )}
                </div>
            )}
        </div>
    );
}
