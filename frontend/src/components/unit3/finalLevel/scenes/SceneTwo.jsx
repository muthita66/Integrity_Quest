import SceneTwoImg from "../../../../assets/unit3/finalLevel/intro/scene2.webp";

export default function SceneTwo() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneTwoImg} alt="Scene Two"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}