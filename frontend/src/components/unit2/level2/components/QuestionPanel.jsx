import { GiBrain } from "react-icons/gi";
export default function QuestionPanel({ question, onHintClick, children }) {
    return (
        <div
            className="
                relative
                w-full
                rounded-[24px]
                border-[4px] border-[#8B5A2B]
                bg-[#FFF4D6]
                px-5
                py-5
                md:px-7
                md:py-6
                shadow-[0_6px_10px_rgba(0,0,0,0.3)]
            "
        >
            {/* Inner dashed border */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-[5px]
                    rounded-[18px]
                    border-2
                    border-dashed
                    border-[#D6B879]
                "
            />

            {/* Content */}
            <div className="relative z-10">

                {/* ================= QUESTION ================= */}
                <div className="flex items-center gap-4">

                    {/* ไอคอน */}
                    <div
                        onClick={onHintClick}
                        className="
                            flex
                            h-12
                            w-12
                            md:h-14
                            md:w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F4D6A0]
                            border-2
                            border-[#B8874A]
                            shadow-md
                            mb-4
                            cursor-pointer
                            transition-all
                            hover:scale-110
                            hover:bg-[#f8e0b6]
                            active:scale-95
                        "
                    >
                        <span className="text-2xl md:text-3xl text-pink-600">
                            <GiBrain />
                        </span>
                    </div>

                    {/* คำถาม */}
                    <div className="flex-1">
                        <p
                            className="
                                text-center
                                text-lg
                                md:text-xl
                                font-black
                                leading-relaxed
                                text-[#3D2B1F]
                                mb-4
                            "
                        >
                            {question}
                        </p>
                    </div>

                </div>

                {/* ================= ANSWER ================= */}
                {children}

            </div>
        </div>
    );
}