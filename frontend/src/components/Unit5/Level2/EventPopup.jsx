import { motion, AnimatePresence } from "framer-motion";
import {
    FaCloudRain,
    FaVirus,
    FaTree,
    FaFire,
    FaTriangleExclamation,
    FaArrowRight,
} from "react-icons/fa6";

const icons = {
    flood: <FaCloudRain size={58} className="text-sky-500" />,
    virus: <FaVirus size={58} className="text-rose-500" />,
    festival: <FaTree size={58} className="text-emerald-500" />,
    fire: <FaFire size={58} className="text-orange-500" />,
};

const eventStyles = {
    flood: "from-sky-100/80 to-blue-50 border-sky-300",
    virus: "from-rose-100/80 to-red-50 border-rose-300",
    festival: "from-emerald-100/80 to-green-50 border-emerald-300",
    fire: "from-orange-100/80 to-amber-50 border-orange-300",
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
            bg-[#160d09]/75
            backdrop-blur-md
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
                        className={`
              relative w-[min(540px,92vw)] overflow-hidden
              rounded-[30px] border-2 bg-gradient-to-br
              ${eventStyles[event.type] || "from-amber-100 to-orange-50 border-amber-300"}
              border-b-[8px] border-[#a9651e]
              shadow-[10px_12px_0_rgba(56,28,10,.3),0_25px_60px_rgba(0,0,0,.4)]
              p-7 md:p-9
            `}
                    >

                        <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-[#f8d36d] via-[#e5952a] to-[#b95d18]" />
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/30" />

                        {/* Header */}

                        <div className="relative flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FaTriangleExclamation
                                    size={30}
                                    className="text-amber-500 drop-shadow-sm"
                                />

                                <h2 className="text-2xl md:text-3xl font-black text-[#2b1b12]">
                                    เหตุการณ์พิเศษ
                                </h2>
                            </div>
                            <span className="rounded-full border border-[#9a671b]/30 bg-white/40 px-3 py-1 text-[10px] font-black tracking-[0.22em] text-[#8a5a20]">
                                CITY EVENT
                            </span>

                        </div>

                        {/* Icon */}

                        <div className="mx-auto mt-7 flex h-28 w-28 items-center justify-center rounded-[30px] border-2 border-white/70 bg-white/45 shadow-[5px_6px_0_rgba(105,63,18,.16)]">
                            {icons[event.type] || <FaTriangleExclamation size={58} className="text-amber-500" />}

                        </div>

                        {/* Title */}

                        <h3
                            className="mt-5 text-center text-3xl font-black text-[#2b1b12] drop-shadow-[2px_2px_0_rgba(255,255,255,.35)]"
                        >
                            {event.title}
                        </h3>

                        {/* Detail */}

                        <p
                            className="mt-4 text-center text-lg font-semibold leading-8 text-[#5c4734]"
                        >
                            {event.description}
                        </p>

                        {/* Effect */}

                        <div className="mt-6 rounded-2xl border-2 border-amber-300/80 bg-[#fff1a8]/80 p-4 text-center shadow-inner">
                            <div className="mb-1 text-[10px] font-black tracking-[0.25em] text-[#9a671b]">ผลกระทบต่อเมือง</div>
                            <div className="font-bold text-[#6b4d2d]">{event.effect}</div>
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
                            className="mt-7 flex w-full items-center justify-center gap-3 rounded-[18px] border-b-[5px] border-[#8f4b12] bg-gradient-to-r from-[#f3c64d] via-[#e79421] to-[#c86416] py-3 text-xl font-black text-[#3d210f] shadow-[5px_6px_0_rgba(111,57,13,.22)]"
                        >
                            รับทราบ <FaArrowRight />
                        </motion.button>

                    </motion.div>

                </motion.div>

            )}

        </AnimatePresence>
    );
}
