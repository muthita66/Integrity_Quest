import { CheckCircle, Circle } from "lucide-react";

export default function InventoryPanel({
    requiredItems,
    cart,
}) {
    return (
        <div
            className="
                bg-white/90
                border-4
                border-black
                rounded-2xl
                p-4
                shadow-xl
            "
        >
            <h2
                className="
                    text-lg
                    font-black
                    mb-3
                "
            >
                รายการจำเป็น
            </h2>

            <div className="space-y-2">
                {requiredItems.map((item) => {
                    const purchasedItem = cart.find(
                        (x) => x.id === item.id
                    );

                    return (
                        <div
                            key={item.id}
                            className="
                                flex
                                items-center
                                gap-2
                                border-2
                                border-black
                                rounded-xl
                                p-2
                                bg-gray-100
                            "
                        >
                            {purchasedItem ? (
                                <CheckCircle className="text-green-600" />
                            ) : (
                                <Circle className="text-gray-400" />
                            )}

                            <span className="font-light">
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}