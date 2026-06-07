import Stone1 from "../../../assets/Stone/Stone1.png";
import Stone2 from "../../../assets/Stone/Stone2.png";
import Stone3 from "../../../assets/Stone/Stone3.png";
import Stone4 from "../../../assets/Stone/Stone4.png";
import Stone5 from "../../../assets/Stone/Stone5.png";
import Stone6 from "../../../assets/Stone/Stone6.png";

function FloatingStonePath() {
    const stones = [
        // ===== 1 -> 2 =====
        {
            x: "24%",
            y: "20%",
            img: Stone1,
            size: 70,
        },
        {
            x: "32%",
            y: "13%",
            img: Stone1,
            size: 70,
        },
        {
            x: "42%",
            y: "12%",
            img: Stone1,
            size: 70,
        },

        // ===== 2 -> 3 =====
        {
            x: "60%",
            y: "12%",
            img: Stone2,
            size: 70,
        },
        {
            x: "68%",
            y: "15%",
            img: Stone2,
            size: 70,
        },
        {
            x: "75%",
            y: "22%",
            img: Stone2,
            size: 70,
        },

        // ===== 3 -> 4 =====
        {
            x: "73%",
            y: "48%",
            img: Stone3,
            size: 70,
        },
        {
            x: "66%",
            y: "54%",
            img: Stone3,
            size: 70,
        },
        {
            x: "57%",
            y: "57%",
            img: Stone3,
            size: 70,
        },

        // ===== 4 -> 5 =====
        {
            x: "37%",
            y: "50%",
            img: Stone5,
            size: 70,
        },
        {
            x: "29%",
            y: "52%",
            img: Stone5,
            size: 70,
        },
        {
            x: "22%",
            y: "59%",
            img: Stone5,
            size: 70,
        },

        // ===== 5 -> 6 =====
        {
            x: "25%",
            y: "89%",
            img: Stone4,
            size: 70,
        },
        {
            x: "33%",
            y: "93%",
            img: Stone4,
            size: 70,
        },
        {
            x: "43%",
            y: "93%",
            img: Stone4,
            size: 70,
        },

        // ===== 6 -> Treasure =====
        {
            x: "69%",
            y: "89%",
            img: Stone6,
            size: 70,
        },
        {
            x: "77%",
            y: "86%",
            img: Stone6,
            size: 70,
        },
        {
            x: "84%",
            y: "82%",
            img: Stone6,
            size: 70,
        },
    ];

    return (
        <>
            {stones.map((stone, index) => (
                <img
                    key={index}
                    src={stone.img}
                    alt=""
                    draggable={false}
                    style={{
                        position: "absolute",
                        left: stone.x,
                        top: stone.y,
                        width: `${stone.size}px`,
                        transform: `
                            translate(-50%, -50%)
                        `,
                        zIndex: 2,
                        pointerEvents: "none",
                        userSelect: "none",

                        filter: `
                            drop-shadow(0 10px 10px rgba(0,0,0,.35))
                        `,
                    }}
                />
            ))}
        </>
    );
}

export default FloatingStonePath;