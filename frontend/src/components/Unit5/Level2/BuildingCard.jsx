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
            whileHover={{ scale: 1.02 }}
            className="
        bg-[#f5ecdf]
        border-2
        border-[#ccb79d]
        rounded-2xl
        shadow-lg
        p-5
        flex
        flex-col
        justify-between
      "
        >
            {/* Header */}

            <div className="flex items-center gap-4">
                <div className="text-4xl text-[#5a3b22]">
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

            <div className="flex gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, i) =>
                    i < stars ? (
                        <BsFillStarFill
                            key={i}
                            className="text-yellow-400 text-xl"
                        />
                    ) : (
                        <BsStar
                            key={i}
                            className="text-gray-300 text-xl"
                        />
                    )
                )}
            </div>

            {/* งบ */}

            <div className="mt-5 flex items-center justify-between">

                <motion.button
                    whileTap={{ scale: .9 }}
                    disabled={budget === 0}
                    onClick={() => onDecrease(building.id)}
                    className="
            w-11
            h-11
            rounded-full
            bg-red-500
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
            bg-green-600
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

            <div className="mt-5">

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