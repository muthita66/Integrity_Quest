import { GiMoneyStack } from "react-icons/gi";

const jarStyles = {
    personal: {
        container:
            "bg-blue-100 border-blue-600",
        item:
            "border-blue-400 text-blue-900",
        description:
            "text-blue-700",
        icon: "👛",
        itemIcon: "💵",
        title: "เงินส่วนตัว",
    },

    club: {
        container:
            "bg-purple-100 border-purple-600",
        item:
            "border-purple-400 text-purple-900",
        description:
            "text-purple-700",
        icon: "🏦",
        itemIcon: "🏦",
        title: "เงินชมรม",
    },
};

export default function MoneyJar({
    type,
    items,
    onDrop,
    title,
}) {
    const style = jarStyles[type] ?? jarStyles.personal;

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (event) => {
        event.preventDefault();
        onDrop(type);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
                flex h-[500px] flex-col items-center
                rounded-[32px] border-4 p-6 shadow-2xl
                transition duration-200
                ${style.container}
            `}
        >
            <h2 className="mb-3 text-2xl font-black text-slate-800">
                {title ?? style.title}
            </h2>

            {/* รายการที่ลากมาวางแล้ว */}
            <div className="w-full flex-1 space-y-2 overflow-y-auto pr-1">
                {items.length === 0 ? (
                    <div className="h-full rounded-2xl border-2 border-dashed border-slate-400 bg-white/50 px-4 py-6 text-center font-bold text-slate-500">
                        ลากรายการเงินมาวางที่นี่
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className={`
                                rounded-2xl border-2 bg-white
                                px-4 py-2 text-sm font-bold shadow
                                ${style.item}
                            `}
                        >
                            <div className="flex items-center gap-2">
                                <GiMoneyStack className="text-green-600 text-2xl" />

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