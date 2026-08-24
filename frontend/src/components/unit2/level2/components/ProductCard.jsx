export default function ProductCard({ item }) {
    return (
        <div className="group relative flex flex-col items-center pt-5">

            {/* Card */}
            <div
                className="
        relative
        w-52 h-48
        md:w-56 md:h-54
        lg:w-60 lg:h-64
        rounded-[28px]
        border-[4px] border-[#8B5A2B]
        bg-[#FFF4D6]
        shadow-[0_8px_15px_rgba(0,0,0,0.35)]
        overflow-visible
        transition-all duration-300
        group-hover:-translate-y-2
        group-hover:shadow-[0_12px_20px_rgba(0,0,0,0.4)]
    "
            >

                {/* Inner Border */}
                <div
                    className="
                        absolute inset-[4px]
                        rounded-[18px]
                        border-2 border-[#D6B879]
                        pointer-events-none
                    "
                />

                {/* ราคา */}
                {item.price > 0 && (
                    <div
                        className="
                            absolute
                            -top-6
                            left-1/2
                            -translate-x-1/2
                            z-20
                            min-w-[100px]
                            md:min-w-[150px]
                            rounded-full
                            border-[3px] border-[#8B5A2B]
                            bg-[#FFD83D]
                            px-4 py-1
                            text-center
                            font-black
                            text-lg md:text-xl
                            text-[#3D2B1F]
                            shadow-[0_4px_6px_rgba(0,0,0,0.25)]
                        "
                    >
                        {item.price.toLocaleString()} บาท
                    </div>
                )}

                {/* รูป + ชื่อสินค้า */}
                <div
                    className="
        relative
        z-10
        flex
        h-full
        w-full
        flex-col
        items-center
        justify-center
        px-3
        pt-4
    "
                >
                    {/* รูปสินค้า */}
                    <img
                        src={item.src}
                        alt={item.alt}
                        className="
            h-24 w-24
            md:h-48 md:w-48
            object-contain
            transition-transform
            duration-300
            group-hover:scale-110
        "
                    />

                    {/* ชื่อสินค้า */}
                    <div
                        className="
            -mt-2
            flex
            w-full
            items-center
            justify-center
            text-center
        "
                    >
                        <span
                            className="
                text-sm
                md:text-lg
                font-bold
                text-[#3B2416]
            "
                        >
                            {item.name}
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}