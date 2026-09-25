import { motion } from "framer-motion";
import { BiSolidStore } from "react-icons/bi";

export default function ShopPanel({
    items,
    addItem,
}) {
    return (
        <div
            className="
                bg-white/90
                border-4
                border-black
                rounded-2xl
                p-5
                shadow-xl
            "
        >
            <h2 className="flex gap-2 text-xl font-black mb-2">
                <BiSolidStore size={28} />
                ร้านค้าอุปกรณ์ค่าย
            </h2>

            <div
                className="
                    grid
                    grid-cols-3
                    lg:grid-cols-4
                    gap-2
                    max-h-[35vh]
                    overflow-y-auto
                    p-2
                "
            >
                {items.map((item) => (
                    <motion.button
                        key={item.id}
                        whileHover={{
                            scale: 1.05,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                        onClick={() => addItem(item)}
                        className="
                            border-4
                            border-black
                            rounded-xl
                            p-3
                            text-left
                            shadow-md
                            bg-pink-100
                        "
                    >
                        {/* Item Image */}
                        <div
                            className="
                                w-full
                                h-24
                                flex
                                items-center
                                justify-center
                                mb-2
                            "
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="
                                        max-h-24
                                        max-w-full
                                        object-contain
                                    "
                                />
                            ) : (
                                <div className="text-4xl">
                                    📦
                                </div>
                            )}
                        </div>

                        {/* Item Name */}
                        <p className="
                            font-base
                            text-black
                        ">
                            {item.name}
                        </p>

                        {/* Item Price */}
                        <p className="
                            font-base
                            text-black
                        ">
                            {Number(item.price || 0).toLocaleString()}
                            บาท
                        </p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}