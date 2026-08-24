export default function ProgressBadge({
    current,
    total,
}) {
    const safeTotal = total > 0 ? total : 1;
    const progress = Math.min(
        100,
        Math.max(0, (current / safeTotal) * 100)
    );

    return (
        <div className="w-full max-w-[240px]">
            <div className="mb-2 flex items-center justify-between rounded-[32px] bg-yellow-300 px-5 py-2 text-sm font-bold text-black">
                <span>ทำแล้ว</span>

                <span>
                    {current}/{total}
                </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-300">
                <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>
        </div>
    );
}