import { useEffect, useState } from "react";

export default function TraitBar({
    label,
    score,
    note,
}) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setWidth(score), 80);
        return () => clearTimeout(t);
    }, [score]);

    return (
        <div className="trait">
            <div className="trait-top">
                <span className="trait-name">{label}</span>
                <span className="trait-score">{score}/100</span>
            </div>

            <div className="trait-bar">
                <div
                    className="trait-bar-fill"
                    style={{ width: width + "%" }}
                />
            </div>

            <p className="trait-note">{note}</p>
        </div>
    );
}