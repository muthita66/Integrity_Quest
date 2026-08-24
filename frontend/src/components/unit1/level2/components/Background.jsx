import bgGameLevel2 from "../../../../assets/unit1/level2/bgGameLevel2.png";

export default function Background({ children }) {
    return (
        <main
            className="
                relative
                min-h-screen
                overflow-hidden
                bg-cover
                bg-center
                bg-no-repeat
            "
            style={{
                backgroundImage: `url(${bgGameLevel2})`,
            }}
        >
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative min-h-screen">
                {children}
            </div>
        </main>
    );
}