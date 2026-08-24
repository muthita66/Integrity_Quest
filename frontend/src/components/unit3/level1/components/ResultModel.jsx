import ResultFailed from "../../../../assets/unit3/level1/resultFailed.png";
import { useNavigate } from "react-router-dom";

export default function ResultModel({ gameStatus, restartGame }) {
    if (gameStatus === "playing") return null;

    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="bg-white rounded-[32px] p-10 w-[520px] text-center shadow-2xl border-4 border-black sarabun-bold">
                <img src={ResultFailed} alt="Result Failed" className="w-64 h-64 rounded-full mx-auto object-cover object-top mb-5" />
                <h2
                    className={`text-4xl font-black mb-0 ${gameStatus === "win" ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {gameStatus === "win" ? "ภารกิจสำเร็จ" : "ภารกิจไม่สำเร็จ"}
                </h2>

                <p className="text-lg font-bold text-slate-700 mb-6">
                    {gameStatus === "win"
                        ? "คุณค้นหาเอกสารทางการเงินได้ครบถ้วนแล้ว"
                        : "หมดเวลา หรือเลือกเอกสารผิดเกินจำนวนที่กำหนด"}
                </p>

                <div className="flex flex-row justify-center gap-4 mt-5">
                    <div className="flex justify-center">
                        <button
                            onClick={restartGame}
                            className="result-button result-button-red"
                        >
                            <span className="result-button-top">เริ่มภารกิจใหม่</span>
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => navigate("/map")}
                            className="result-button result-button-yellow"
                        >
                            <span className="result-button-top">กลับหน้าหลัก</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
