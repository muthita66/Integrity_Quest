import bgLevel from "../../../../assets/unit2/bgLevel2.png"

export default function GameContainer({ children }) {
    return (
        <div className="w-full max-w-5xl relative">
            <img src={bgLevel} alt="" className="w-full h-auto block" />
            <div className="absolute inset-0 flex flex-col px-14 pb-8 pt-10 md:px-26 md:pb-14 md:pt-12">
                {children}
            </div>
        </div>
    );
}