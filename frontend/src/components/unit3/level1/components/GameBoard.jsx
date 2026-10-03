import bgGameLevel1 from "../../../../assets/unit3/level1/bgGameLevel1.png";

export default function GameBoard({ children }) {
    return (
        <div className="relative w-full h-full overflow-hidden bg-[#9b5f2e] sarabun-bold">
            {/* Desk Background */}
            <div
                className="absolute inset-0 pt-28 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgGameLevel1})` }}
            >
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)]" />
            </div>

            {children}
        </div>
    );
}
