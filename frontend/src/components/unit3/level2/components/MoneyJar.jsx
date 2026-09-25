import { useEffect, useState } from "react";
import { GiMoneyStack } from "react-icons/gi";

const jarStyles = {
    personal: {
        container: "bg-blue-100 border-blue-600",
        over: "bg-blue-200 border-blue-700 ring-8 ring-blue-300/70 scale-[1.02]",
        dropHint: "border-blue-500 bg-blue-50 text-blue-700",
        item: "border-blue-400 text-blue-900",
        description: "text-blue-700",
        icon: "👛",
        itemIcon: "💵",
        title: "เงินส่วนตัว",
    },

    club: {
        container: "bg-purple-100 border-purple-600",
        over: "bg-purple-200 border-purple-700 ring-8 ring-purple-300/70 scale-[1.02]",
        dropHint: "border-purple-500 bg-purple-50 text-purple-700",
        item: "border-purple-400 text-purple-900",
        description: "text-purple-700",
        icon: "🏦",
        itemIcon: "🏦",
        title: "เงินชมรม",
    },
};

// ============================================================
// MoneyJar — ช่องวางเงิน
// ------------------------------------------------------------
// รับการลากจาก MoneyCard ผ่าน window event
//   "moneyjar:hover" → ไฮไลต์เมื่อการ์ดอยู่เหนือช่องนี้
//   "moneyjar:drop"  → เรียก onDrop(type)
// ============================================================

export default function MoneyJar({ type, items, onDrop, title }) {
    const style = jarStyles[type] ?? jarStyles.personal;

    const [isOver, setIsOver] = useState(false);

    useEffect(() => {
        const handleHover = (event) => {
            setIsOver(event.detail?.type === type);
        };

        const handleDropEvent = (event) => {
            if (event.detail?.type !== type) return;

            setIsOver(false);
            onDrop(type);
        };

        window.addEventListener("moneyjar:hover", handleHover);
        window.addEventListener("moneyjar:drop", handleDropEvent);

        return () => {
            window.removeEventListener("moneyjar:hover", handleHover);
            window.removeEventListener("moneyjar:drop", handleDropEvent);
        };
    }, [type, onDrop]);

    return (
        <div
            data-money-jar={type}
            className={`
                flex h-[500px] flex-col items-center
                rounded-[32px] border-4 p-6 shadow-2xl
                transition-all duration-150
                ${isOver ? style.over : style.container}
            `}
        >
            <h2 className="mb-3 text-2xl font-black text-slate-800">
                {title ?? style.title}
            </h2>

            {/* แถบบอกว่าปล่อยได้ (แสดงตอนลากมาอยู่เหนือช่อง) */}
            {isOver && items.length > 0 && (
                <div
                    className={`mb-2 w-full rounded-2xl border-2 border-dashed px-4 py-2 text-center text-sm font-black ${style.dropHint}`}
                >
                    ปล่อยเพื่อวางที่ “{title ?? style.title}”
                </div>
            )}

            {/* รายการที่ลากมาวางแล้ว */}
            <div className="w-full flex-1 space-y-2 overflow-y-auto pr-1">
                {items.length === 0 ? (
                    <div
                        className={`
                            flex h-full items-start justify-center rounded-2xl border-2 border-dashed
                            px-4 py-6 text-center font-bold transition-colors duration-150
                            ${isOver
                                ? style.dropHint
                                : "border-slate-400 bg-white/50 text-slate-500"
                            }
                        `}
                    >
                        {isOver
                            ? `ปล่อยเพื่อวางที่ “${title ?? style.title}”`
                            : "ลากรายการเงินมาวางที่นี่"}
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id ?? item.item_id}
                            className={`
                                rounded-2xl border-2 bg-white
                                px-4 py-2 text-sm font-bold shadow
                                ${style.item}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <GiMoneyStack className="text-2xl text-green-600" />

                                <div>
                                    <p>{item.text}</p>

                                    <p className="mt-1 text-xs opacity-75">
                                        {item.amount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}