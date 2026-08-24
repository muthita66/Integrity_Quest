import { motion } from "framer-motion";

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

            <h2 className="
                text-xl
                font-black
                mb-2
            ">
                🏪 ร้านค้าอุปกรณ์ค่าย
            </h2>


            <div className="
                grid
                grid-cols-3
                lg:grid-cols-4
                gap-2
                max-h-[35vh]
                overflow-y-auto
                p-2
            ">

                {
                    items.map(item => (

                        <motion.button

                            key={item.id}

                            whileHover={{
                                scale: 1.05
                            }}

                            whileTap={{
                                scale: .95
                            }}

                            onClick={() =>
                                addItem(item)
                            }


                            className={`
                            border-4
                            border-black
                            rounded-xl
                            p-3
                            text-left
                            shadow-md

                            ${item.type === "need"
                                    ?
                                    "bg-pink-100"
                                    :
                                    "bg-pink-100"
                                }
                        `}

                        >

                            <div className="
                            text-4xl
                            text-center
                            mb-2
                        ">
                                {item.icon}
                            </div>


                            <p className="
                            font-base
                            text-black
                        ">
                                {item.name}
                            </p>


                            <p className="
                            font-base
                            text-black
                        ">
                                {item.price.toLocaleString()}
                                บาท
                            </p>

                        </motion.button>

                    ))
                }

            </div>

        </div>

    );
}