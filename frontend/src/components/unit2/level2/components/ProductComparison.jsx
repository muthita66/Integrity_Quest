import React from "react";
import ProductCard from "./ProductCard";

export default function ProductComparison({ items }) {
    return (
        <div className="flex justify-center items-center gap-2 md:gap-12 mb-2 w-full">
            {items.map((item, idx) => (
                <React.Fragment key={item.name}>
                    <ProductCard item={item} />

                    {idx === 0 && (
                        <div
                            className="
            relative
            text-5xl md:text-6xl
            font-black
            italic
            tracking-wider
            text-transparent
            bg-clip-text
            bg-gradient-to-b
            from-yellow-200
            via-yellow-400
            to-orange-500
            drop-shadow-[0_4px_0_#8a4b00]
            drop-shadow-[0_7px_8px_rgba(0,0,0,0.45)]
        "
                            style={{
                                WebkitTextStroke: "2px #fff3b0",
                                textShadow: `
                0 2px 0 #fff8c7,
                0 4px 0 #d88900,
                0 6px 0 #9a5200,
                0 8px 12px rgba(0,0,0,0.45),
                0 0 15px rgba(255,193,7,0.55)
            `,
                            }}
                        >
                            VS
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}