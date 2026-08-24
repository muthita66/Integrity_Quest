import needIcon from "../../../../assets/unit2/level1/need.png";
import wantIcon from "../../../../assets/unit2/level1/want.png";

function BasketZone({
    id,
    zone,
    title,
    subtitle,
    items,
    colorTheme,
    onDragOver,
    onDrop,
    onDragStart,
    onDragEnd,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
}) {
    const isNeed = zone === "need";
    const icon = isNeed ? needIcon : wantIcon;

    // Theme specific classes
    const containerBorder = isNeed ? "border-green-600" : "border-orange-500";
    const containerBg = "bg-white/95";
    const innerBorder = isNeed ? "border-green-500" : "border-orange-400";
    const headerBg = isNeed ? "bg-green-600" : "bg-orange-500";

    return (
        <div className="relative mt-8">
            {/* Header Badge */}
            <div className={`absolute -top-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full ${headerBg} px-6 py-2 shadow-lg z-10 border-4 border-white`}>
                <img
                    src={icon}
                    alt={title}
                    className="h-10 w-10 scale-200 object-contain drop-shadow-md"
                />
                <div className="text-white">
                    <h3 className="text-xl font-bold leading-tight">{title}</h3>
                    <p className="text-xs">{subtitle}</p>
                </div>
            </div>

            {/* Drop Zone Container */}
            <div
                id={id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, zone)}
                className={`flex min-h-[250px] w-full flex-col rounded-3xl border-8 ${containerBorder} ${containerBg} p-2 shadow-md transition-all`}
            >
                {/* Dashed Inner Area */}
                <div className={`flex flex-1 flex-col items-center justify-center rounded-2xl border-4 border-dashed ${innerBorder} p-2`}>
                    <div className="flex w-full flex-wrap justify-center gap-2">
                        {items?.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, item, zone)}
                                onDragEnd={onDragEnd}
                                onTouchStart={(e) => onTouchStart(e, item, zone)}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                onTouchCancel={onTouchCancel}
                                className="flex w-[110px] cursor-grab flex-col items-center justify-center rounded-xl bg-white p-1 shadow-md hover:-translate-y-1 hover:shadow-lg active:cursor-grabbing"
                            >
                                <img
                                    src={item.src}
                                    alt={item.alt}
                                    className="h-16 w-16 object-contain"
                                />
                                <p className="mt-1 text-center text-xs font-semibold text-slate-700">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BasketZone;
