export default function GameHeader({ score }) {
    return (
        <header
            className="
                pointer-events-none
                absolute
                left-1/2
                top-5
                z-40
                -translate-x-1/2
                text-center
                sarabun-bold
            "
        >
            <h1 className="mt-20 text-4xl font-black text-white">
                จิตวิทยาคนโกง
            </h1>

            <p className="mt-2 text-white">
                ยิงทำลายข้ออ้างของการโกงให้หมด
            </p>
        </header>
    );
}