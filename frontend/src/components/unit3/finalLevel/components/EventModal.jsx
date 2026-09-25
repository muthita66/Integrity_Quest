export default function EventModal({
    event,
    applyEvent,
    closeEvent,
}) {
    if (!event) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/60
                p-4
            "
        >
            <div
                className="
                    w-full
                    max-w-xl
                    overflow-hidden
                    rounded-2xl
                    border-4
                    border-black
                    bg-white
                    shadow-2xl
                "
            >
                {/* Header */}
                <div
                    className="
                        border-b-4
                        border-black
                        bg-orange-300
                        p-4
                    "
                >
                    <h2 className="text-2xl font-black">
                        ⚠️ {event.title}
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="mb-6 text-lg font-bold">
                        {event.description}
                    </p>

                    {/* Choices */}
                    <div className="space-y-4">
                        {event.choices?.map((choice) => (
                            <button
                                key={choice.choice_id}
                                type="button"
                                onClick={() => applyEvent(choice)}
                                className="
                                    w-full
                                    rounded-xl
                                    border-4
                                    border-black
                                    bg-yellow-200
                                    px-5
                                    py-3
                                    text-lg
                                    font-black
                                    shadow-md
                                    transition-all
                                    hover:scale-[1.02]
                                    hover:bg-yellow-300
                                    active:scale-95
                                "
                            >
                                {choice.choice_text}
                            </button>
                        ))}
                    </div>

                    {/* Close */}
                    <button
                        type="button"
                        onClick={closeEvent}
                        className="
                            mt-4
                            w-full
                            rounded-xl
                            border-2
                            border-black
                            bg-gray-200
                            px-5
                            py-3
                            font-black
                            hover:bg-gray-300
                        "
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}