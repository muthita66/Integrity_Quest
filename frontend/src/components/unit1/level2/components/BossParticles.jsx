import { AnimatePresence, motion } from "framer-motion";

export default function BossParticles({ particles }) {
    if (!particles || particles.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="
                        pointer-events-none
                        absolute
                        z-20
                        rounded-full
                        border
                        border-white
                        bg-white/40
                    "
                    style={{
                        left: `calc(50% + ${particle.offsetX}px)`,
                        top: `calc(50% + ${particle.offsetY}px)`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    initial={{
                        opacity: 1,
                        scale: 0,
                    }}
                    animate={{
                        opacity: 0,
                        scale: 1,
                        y: -150,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        duration: particle.duration,
                        ease: "easeOut",
                    }}
                />
            ))}
        </AnimatePresence>
    );
}