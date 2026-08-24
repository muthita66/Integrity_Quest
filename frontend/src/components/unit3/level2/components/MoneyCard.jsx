import { GiMoneyStack } from "react-icons/gi";

export default function MoneyCard({
    item,
    onDragStart,
}) {
    const isTrap = item.type === "trap";

    const handleDragStart = (event) => {
        event.dataTransfer.effectAllowed = "move";

        onDragStart(item);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="
                cursor-grab rounded-xl border-2 border-amber-600
                bg-yellow-100 p-4 shadow-lg
                transition duration-200
                hover:scale-[1.01] hover:bg-yellow-50
                active:cursor-grabbing active:scale-95
            "
        >
            <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center text-5xl">
                    {isTrap ? "⚠️" : <GiMoneyStack className="text-green-600" />}
                </div>

                <div className="min-w-0 text-left">
                    <p className="font-black text-slate-800">
                        {item.text}
                    </p>

                    <p className="font-bold text-emerald-700">
                        {item.amount}
                    </p>
                </div>
            </div>
        </div>
    );
}