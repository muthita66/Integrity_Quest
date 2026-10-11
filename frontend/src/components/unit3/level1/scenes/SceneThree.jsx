import SceneThreeImage from "../../../../assets/unit3/level1/intro/SceneThree.webp";

export default function SceneThree({
    onNext,
    onBack,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            {/* Background Image */}
            <img
                src={SceneThreeImage}
                alt="Scene Three"
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    );
}