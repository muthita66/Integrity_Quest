function ItemCard({ item, onAdd, disabled }) {
    return (
        <div
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${disabled
                ? "opacity-50"
                : "hover:-translate-y-1 hover:shadow-lg"
                }`}
        >
            <div className="flex h-40 items-center justify-center bg-slate-100">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="text-5xl">🛍️</span>
                )}
            </div>

            <div className="p-4">
                <p className="text-xs text-slate-400">
                    {item.category}
                </p>

                <h3 className="mt-1 font-bold">
                    {item.name}
                </h3>

                <p className="mt-1 text-lg font-bold text-blue-600">
                    {item.price === 0
                        ? "ฟรี"
                        : `${item.price.toLocaleString()} บาท`}
                </p>

                <button
                    onClick={() => onAdd(item)}
                    disabled={disabled}
                    className="mt-3 w-full rounded-xl bg-blue-600 px-3 py-2 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed"
                >
                    {disabled ? "เลือกแล้ว" : "เลือก"}
                </button>
            </div>
        </div>
    );
}

export default ItemCard;