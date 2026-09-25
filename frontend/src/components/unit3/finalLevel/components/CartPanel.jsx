import { motion } from "framer-motion";
import {
    Trash2,
    ShoppingCart,
    Plus,
    Minus,
} from "lucide-react";

export default function CartPanel({
    cart,
    totalPrice,
    remaining,
    removeItem,
    increaseItem,
    decreaseItem,
    checkout,
}) {
    return (
        <div
            className="bg-white/90 border-4 border-black rounded-2xl p-5 shadow-xl">

            {/* HEADER */}
            <div className="flex gap-2 items-centergap-2 mb-4">
                <ShoppingCart size={32} />
                <h2 className="text-xl font-black">ตะกร้า</h2>
            </div>

            {/* ITEM LIST */}
            <div className="max-h-[25vh] overflow-y-auto pr-2">
                {
                    cart.length === 0 ? (
                        <p
                            className="text-center text-gray-500 font-bold"
                        >
                            ยังไม่มีสินค้า
                        </p>
                    ) :
                        cart.map(item => {
                            const quantity = item.quantity || 1;
                            const itemTotal = item.price * quantity;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-gray-100 border-2 border-black rounded-xl p-3">
                                    <div
                                        className="flex justify-between items-center">
                                        <div>
                                            <p className="font-black">
                                                {item.icon}
                                                {" "}
                                                {item.name}
                                            </p>
                                            <p className="text-sm">
                                                {item.price.toLocaleString()}
                                                {" "}
                                                บาท / ชิ้น
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="bg-red-500 text-white rounded-full p-2">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    {/* QUANTITY */}
                                    <div
                                        className="mt-3 flex justify-between items-center bg-white border-2 border-black rounded-lg px-3 py-2">
                                        <span className="font-bold">จำนวน</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() =>
                                                    decreaseItem(item.id)
                                                }

                                                className="bg-gray-300 border-2 border-black rounded-full p-1">
                                                <Minus size={16} />
                                            </button>

                                            <span className="font-black text-lg">x{quantity}</span>
                                            <button
                                                onClick={() =>
                                                    increaseItem(item.id)
                                                }
                                                className="bg-green-400 border-2 border-black rounded-full p-1">
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* TOTAL ITEM */}
                                    <div className="mt-2 text-right font-black">
                                        รวม :{" "}
                                        {itemTotal.toLocaleString()}
                                        บาท
                                    </div>
                                </div>
                            );
                        })
                }
            </div>
            {/* SUMMARY */}
            <div
                className="
                    border-t-2
                    border-black
                    mt-5
                    pt-4
                "
            >
                <div
                    className="
                        flex
                        justify-between
                        font-bold
                    "
                >
                    <span>รวม</span>
                    <span> {totalPrice.toLocaleString()}บาท</span>
                </div>
                <div
                    className="
                        flex
                        justify-between
                        font-bold
                    "
                >
                    <span>เหลือ</span>
                    <span className={`
                            ${remaining < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }
                        `}
                    >
                        {remaining.toLocaleString()}บาท
                    </span>
                </div>

                {cart.length > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={checkout}
                        className="
            mt-4
            w-full
            bg-green-500
            text-white
            border-2
            border-black
            rounded-xl
            py-3
            font-black
        "
                    >
                        ชำระเงิน
                    </motion.button>
                )}
            </div>
        </div>
    );
}