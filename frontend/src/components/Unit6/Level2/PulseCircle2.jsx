import { useEffect, useRef, useState } from "react";

// A lantern's inner glow. On pulseTrigger it briefly flares — a soft
// expanding ring plus a quick scale-up of the body itself, like a lantern
// catching a gust of warm air when a new connection lands.
export default function PulseCircle({
    cx,
    cy,
    r,
    fill,
    stroke,
    strokeWidth,
    filter,
    pulseTrigger,
}) {
    const [animating, setAnimating] = useState(false);
    const prevTrigger = useRef(pulseTrigger);

    useEffect(() => {
        if (pulseTrigger !== prevTrigger.current) {
            prevTrigger.current = pulseTrigger;
            setAnimating(true);
            const t = setTimeout(() => setAnimating(false), 520);
            return () => clearTimeout(t);
        }
    }, [pulseTrigger]);

    return (
        <>
            {animating && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={2}
                    opacity={0.6}
                    style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        animation: "gng-pulse-ring .52s ease-out forwards",
                    }}
                />
            )}
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                filter={filter}
                style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: animating ? "scale(1.16)" : "scale(1)",
                    transition: "transform .18s ease, stroke-width .15s ease",
                }}
            />
        </>
    );
}