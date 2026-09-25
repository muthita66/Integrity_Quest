export default function FeedbackMessage({ feedback, hint, hasMistakeOnCurrent }) {
    if (feedback === "correct") {
        return (
            <div className="absolute top-full mt-0 left-0 w-full text-emerald-600 font-bold text-sm text-center animate-bounce">
                {hasMistakeOnCurrent ? "ถูกต้อง!" : "ถูกต้อง! + 1 IP"}
            </div>
        );
    }
    return null;
}