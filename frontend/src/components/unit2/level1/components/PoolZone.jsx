function PoolZone({
    items,
    isAllPlaced,
    onDragOver,
    onDrop,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
}) {
    if (isAllPlaced) return null;

    return (
        <div className="relative mt-6 w-full">
            {/* Wooden Board Container */}
            <div
                id="zone-pool"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, "pool")}
                className="w-full rounded-2xl border-4 border-[#8B5A2B] bg-[#DEB887] px-4 py-3 shadow-inner"
            >
                <div className="flex w-full overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-track-[#c29665] scrollbar-thumb-[#8B5A2B]">
                    <div className="flex gap-3 px-2">
                        {items?.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, item, "pool")}
                                onDragEnd={onDragEnd}
                                onTouchStart={(e) => onTouchStart(e, item, "pool")}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                onTouchCancel={onTouchCancel}
                                className="flex h-22 w-24 shrink-0 cursor-grab flex-col items-center justify-center rounded-xl bg-white p-2 shadow-md hover:-translate-y-1 hover:shadow-lg active:cursor-grabbing border-b-4 border-slate-200"
                            >
                                <img src={item.src} alt={item.alt} className="h-14 w-14 object-contain" />
                                <p className="mt-2 text-xs font-bold text-slate-800 text-center">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PoolZone;
