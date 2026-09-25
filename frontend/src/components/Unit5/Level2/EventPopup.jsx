import { motion, AnimatePresence } from "framer-motion";
import {
    FaCloudRain,
    FaVirus,
    FaTree,
    FaFire,
    FaTriangleExclamation,
} from "react-icons/fa6";

const icons = {
    flood: <FaCloudRain size={50} className="text-blue-500" />,
    virus: <FaVirus size={50} className="text-red-500" />,
    festival: <FaTree size={50} className="text-green-600" />,
    fire: <FaFire size={50} className="text-orange-500" />,
};

export default function EventPopup({
    event,
    open,
    onClose,
}) {
    if (!event) return null;

    return (
        <AnimatePresence>

            {open && (

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            flex
            items-center
            justify-center
            z-50
          "
                >

                    <motion.div
                        initial={{
                            scale: .7,
                            opacity: 0,
                            y: 40
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0
                        }}
                        exit={{
                            scale: .8,
                            opacity: 0
                        }}
                        transition={{
                            duration: .3
                        }}
                        className="
              w-[520px]
              bg-[#f5ecdf]
              rounded-2xl
              border-4
              border-[#c8b49b]
              shadow-2xl
              p-8
            "
                    >

                        {/* Header */}

                        <div className="flex items-center gap-4">

                            <FaTriangleExclamation
                                size={32}
                                className="text-amber-500"
                            />

                            <h2
                                className="
                  text-3xl
                  font-black
                  text-[#2b1b12]
                "
                            >
                                เหตุการณ์พิเศษ
                            </h2>

                        </div>

                        {/* Icon */}

                        <div className="flex justify-center mt-8">

                            {icons[event.type]}

                        </div>

                        {/* Title */}

                        <h3
                            className="
                text-center
                text-3xl
                font-black
                mt-5
                text-[#2b1b12]
              "
                        >
                            {event.title}
                        </h3>

                        {/* Detail */}

                        <p
                            className="
                mt-5
                text-center
                text-lg
                leading-8
                text-[#5c4734]
              "
                        >
                            {event.description}
                        </p>

                        {/* Effect */}

                        <div
                            className="
                mt-6
                bg-yellow-100
                border
                border-yellow-300
                rounded-xl
                p-4
                text-center
                font-bold
                text-[#6b4d2d]
              "
                        >
                            {event.effect}
                        </div>

                        {/* Button */}

                        <motion.button
                            whileHover={{
                                scale: 1.05
                            }}
                            whileTap={{
                                scale: .95
                            }}
                            onClick={onClose}
                            className="
                mt-8
                w-full
                py-3
                rounded-xl
                bg-[#8b5a2b]
                text-white
                text-xl
                font-black
              "
                        >
                            รับทราบ
                        </motion.button>

                    </motion.div>

                </motion.div>

            )}

        </AnimatePresence>
    );
}