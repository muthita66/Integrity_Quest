import { motion } from "framer-motion";
import { BsFillStarFill, BsStar } from "react-icons/bs";

export default function BuildingCard({
    building,
    budget,
    remaining,
    onIncrease,
    onDecrease,
}) {
    const stars = Math.min(
        5,
        Math.round(
            budget /
            5
        )
    );

    return (
        <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
            className="
        min-w-0
        bg-[#fff8e7]/95
        border-2
        border-[#e0a33d]
        rounded-[26px]
        shadow-[7px_8px_0_rgba(70,38,15,.2),0_12px_26px_rgba(50,25,8,.2)]
        backdrop-blur-sm
        p-4
        flex
        flex-col
        justify-between
      "
        >
            {/* Header */}

            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4c45a]/35 text-3xl text-[#6b401d] shadow-inner">
                    {building.icon}
                </div>

                <div>
                    <h2 className="text-xl font-black text-[#2b1b12]">
                        {building.name}
                    </h2>

                    <p className="text-sm text-[#7d6754]">
                        งบประมาณ {budget}
                    </p>
                </div>
            </div>

            {/* ดาว */}

            <div className="flex gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) =>
                    i < stars ? (
                        <BsFillStarFill
                            key={i}
                            className="text-yellow-400 text-lg"
                        />
                    ) : (
                        <BsStar
                            key={i}
                            className="text-gray-300 text-lg"
                        />
                    )
                )}
            </div>

            {/* งบ */}

            <div className="mt-3 flex items-center justify-between">

                <motion.button
                    whileTap={{ scale: .9 }}
                    disabled={budget === 0}
                    onClick={() => onDecrease(building.id)}
                    className="
            w-11
            h-11
            rounded-full
                    bg-gradient-to-br from-rose-400 to-red-600
            text-white
            text-2xl
            font-black
            disabled:bg-gray-300
          "
                >
                    −
                </motion.button>

                <div className="text-3xl font-black text-[#4b2d19]">
                    {budget}
                </div>

                <motion.button
                    whileTap={{ scale: .9 }}
                    disabled={remaining < 5}
                    onClick={() => onIncrease(building.id)}
                    className="
            w-11
            h-11
            rounded-full
                    bg-gradient-to-br from-emerald-400 to-green-600
            text-white
            text-2xl
            font-black
            disabled:bg-gray-300
          "
                >
                    +
                </motion.button>

            </div>

            {/* Progress */}

            <div className="mt-3">

                <div className="h-3 rounded-full bg-[#d8c8b5] overflow-hidden">

                    <motion.div
                        animate={{
                            width: `${budget}%`,
                        }}
                        transition={{
                            duration: .25,
                        }}
                        className="
              h-full
              bg-gradient-to-r
              from-amber-500
              to-yellow-400
            "
                    />

                </div>

            </div>
        </motion.div>
    );
}
