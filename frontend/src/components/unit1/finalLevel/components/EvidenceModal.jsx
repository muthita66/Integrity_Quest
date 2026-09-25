import Cross from "../../../../assets/unit1/finalLevel/case/cross.png";
import { TfiSave } from "react-icons/tfi";

export default function EvidenceModal({
    currentCase,
    evidence,
    isCollected,
    onCollect,
    onClose,
}) {
    if (!evidence) return null;

    const Icon = evidence.icon;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ backgroundColor: "rgba(20,15,8,0.55)" }}
            onClick={onClose}
        >
            <div
                className="relative cid-paper rounded-xl px-6 py-6 w-[900px] h-[510px] border"
                style={{ borderColor: "#C9BB98" }}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center gap-2 mb-3">
                    {Icon && <Icon size={20} color="#4A3B22" />}

                    <p
                        className="cid-display font-bold text-xl"
                        style={{ color: "#2B2118" }}
                    >
                        {evidence.name}
                    </p>
                </div>

                <p
                    className="text-base leading-start mb-6"
                    style={{ color: "#3A2E1B" }}
                >
                    {evidence.detail}
                </p>

                {evidence.image && (
                    <img
                        src={evidence.image}
                        alt={evidence.name}
                        className={`${evidence.imageClass} mx-auto mb-3 object-contain`}
                    />
                )}

                <button
                    type="button"
                    onClick={() => {
                        if (!isCollected) {
                            onCollect(evidence);
                        }
                        onClose();
                    }}
                    className={`
                        absolute top-3 right-3
                        w-11 h-11 rounded-full
                        flex items-center justify-center
                        border-2 cursor-pointer
                        transition-all duration-200
                        hover:scale-110 active:scale-95
                        ${isCollected
                            ? "bg-transparent border-transparent hover:bg-white"
                            : "bg-orange-500 border-orange-600 text-white shadow-md hover:bg-orange-400"
                        }
                    `}
                    title={isCollected ? "ปิด" : "บันทึกลงแฟ้มคดี"}
                >
                    {isCollected ? (
                        <img
                            src={Cross}
                            alt="ปิด"
                            className="w-7 h-7 object-contain"
                        />
                    ) : (
                        <TfiSave size={20} />
                    )}
                </button>
            </div>
        </div>
    );
}