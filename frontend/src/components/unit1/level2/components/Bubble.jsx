import { motion } from "framer-motion";

export default function Bubble({ bubble, onShoot }) {
    return (
        <motion.div
            className="absolute z-10 cursor-pointer"
            style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
            }}
            initial={{
                opacity: 0,
                scale: 0,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                x: [0, bubble.moveX, 0],
                y: [0, bubble.moveY, 0],
            }}
            exit={{
                scale: 1.5,
                opacity: 0,
                filter: "brightness(1.5) blur(5px)",
                transition: {
                    duration: 0.3,
                    ease: "easeOut",
                },
            }}
            transition={{
                x: {
                    duration: bubble.duration * 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                y: {
                    duration: bubble.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                default: {
                    duration: 0.3,
                },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShoot(bubble)}
        >
            <img
                src={bubble.image}
                alt={bubble.text}
                draggable={false}
                className="
                    h-32
                    w-32
                    select-none
                    rounded-full
                    object-cover
                    shadow-lg
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    px-4
                    text-center
                    text-sm
                    font-bold
                    text-black
                "
            >
                {bubble.text}
            </div>
        </motion.div>
    );
}