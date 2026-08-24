import MoneyCard from "./MoneyCard";

export default function MoneyList({
    items,
    onDragStart,
}) {
    return (
        <div className="flex h-[500px] flex-col rounded-[32px] border-8 border-yellow-500 bg-white p-5 shadow-2xl">
            <h2 className="mb-4 text-center text-2xl font-black text-amber-900">
                รายการเงินที่ต้องแยก
            </h2>

            <div className="min-h-0 w-full flex-1 space-y-4 overflow-y-auto pr-2">
                {items.length > 0 ? (
                    items.map((item) => (
                        <MoneyCard
                            key={item.id}
                            item={item}
                            onDragStart={onDragStart}
                        />
                    ))
                ) : (
                    <div className="flex min-h-[250px] items-center justify-center text-center">
                        <div>
                            <p className="mt-4 text-xl font-black text-emerald-700">
                                แยกรายการครบแล้ว
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}