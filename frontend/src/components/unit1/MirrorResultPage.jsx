import { useNavigate } from "react-router-dom";

export default function MirrorResultPage() {
    const navigate = useNavigate();

    const score =
        Number(localStorage.getItem("mirrorScore")) || 0;

    const getResult = () => {
        if (score >= 80) {
            return {
                title: "🏆 ผู้พิทักษ์แห่งความซื่อสัตย์",
                message:
                    "กระจกแห่งความซื่อสัตย์ยอมรับเจ้าเป็นผู้พิทักษ์อย่างแท้จริง",
                mirror: "🌟👑🪞👑🌟",
                color: "text-yellow-400",
            };
        }

        if (score >= 50) {
            return {
                title: "⭐ ผู้ฝึกฝนคุณธรรม",
                message:
                    "เจ้ากำลังเดินบนเส้นทางแห่งคุณธรรม และมีศักยภาพที่จะเป็นผู้พิทักษ์ในอนาคต",
                mirror: "✨🪞✨",
                color: "text-sky-400",
            };
        }

        return {
            title: "🪞 กระจกแตกร้าว",
            message:
                "กระจกสะท้อนให้เห็นจุดที่ต้องพัฒนาตนเองเพิ่มเติม ลองกลับไปทบทวนการตัดสินใจอีกครั้ง",
            mirror: "💥🪞",
            color: "text-red-400",
        };


    };

    const result = getResult();

    const handleReplay = () => {
        localStorage.removeItem("mirrorScore");
        navigate("/unit1/Quizlevel1");
    };

    const handleBackMap = () => {
        navigate("/map");
    };

    return (<div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-black flex items-center justify-center p-6">

        ```
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 text-center">

            <div className="text-8xl mb-6 animate-pulse">
                {result.mirror}
            </div>

            <h1
                className={`text-4xl font-bold mb-6 ${result.color}`}
            >
                {result.title}
            </h1>

            <div className="mb-6">
                <p className="text-gray-300 text-lg">
                    คะแนนคุณธรรม
                </p>

                <div className="text-6xl font-bold text-white mt-2">
                    {score}
                </div>
            </div>

            <div className="mb-8">
                <p className="text-gray-200 leading-relaxed">
                    {result.message}
                </p>
            </div>



            <div className="flex flex-col md:flex-row gap-4 justify-center">

                <button
                    onClick={handleReplay}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl transition"
                >
                    เล่นอีกครั้ง
                </button>

                <button
                    onClick={handleBackMap}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-xl transition"
                >
                    กลับหน้าหลัก
                </button>

            </div>

        </div>
    </div>

    );
}
