import { ImCross } from "react-icons/im";

export default function Popup({ popup, onClose }) {
    if (!popup.show) return null;

    const isSuccess = popup.type === "success";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-80 rounded-3xl bg-white p-8 text-center shadow-2xl animate-[fadeIn_.2s_ease]">
                <h2
                    className={`mb-3 text-3xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {isSuccess ? "🎉 สำเร็จ!" : <ImCross className="inline-block mr-2 text-red-600 text-3xl" />}
                </h2>

                <p className="mb-6 text-gray-700">{popup.message}</p>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-indigo-600 px-6 py-2 text-white transition hover:bg-indigo-700"
                    >
                        ตกลง
                    </button>
                )}
            </div>
        </div>
    );
}