import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";


export default function EventModal({
    event,
    applyEvent,
    closeEvent,
}) {
    if (!event) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1
                }}
                className="
                    fixed
                    inset-0
                    bg-black/60
                    z-50
                    flex
                    items-center
                    justify-center
                    p-4
                "
            >
                <motion.div
                    initial={{
                        scale: .8
                    }}
                    animate={{
                        scale: 1
                    }}
                    className="
                        bg-white
                        border-4
                        border-black
                        rounded-2xl
                        w-full
                        max-w-xl
                        shadow-2xl
                    ">
                    <div
                        className="
                            bg-orange-300
                            border-b-4
                            border-black
                            p-4
                            flex
                            gap-3
                            items-center
                        ">

                        <AlertTriangle size={35} />
                        <h2 className="
                            text-2xl
                            font-black
                        ">
                            {event.title}
                        </h2>
                    </div>
                    <div className="
                        p-5
                    ">
                        <p className="
                            font-bold
                            text-lg
                        ">
                            {event.description}
                        </p>
                    </div>

                    <div className="
                        p-5
                        space-y-3
                    ">
                        {
                            event.choices.map(choice => (
                                <button
                                    key={choice.id}
                                    onClick={() =>
                                        applyEvent(choice)
                                    }
                                    className="
                                    w-full
                                    bg-yellow-200
                                    hover:bg-yellow-300
                                    border-4
                                    border-black
                                    rounded-xl
                                    py-3
                                    font-black
                                "
                                >
                                    {choice.text}
                                </button>
                            ))
                        }
                        <button
                            onClick={closeEvent}
                            className="
                            w-full
                            bg-gray-300
                            border-2
                            border-black
                            rounded-xl
                            py-2
                            font-bold
                        "
                        >
                            ปิด
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}