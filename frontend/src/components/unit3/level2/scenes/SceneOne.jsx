import SceneOneImg from "../../../../assets/unit3/level2/intro/SceneOne.png";

export default function SceneOne() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10">
            <img src={SceneOneImg} alt="Scene One"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90" />
        </div>
    );
}