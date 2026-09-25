import SceneThreeImg from "../../../../assets/unit3/finalLevel/intro/Scene3.png";

export default function SceneThree() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneThreeImg} alt="Scene Three" className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}