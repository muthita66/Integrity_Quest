export const RANDOM_EVENTS = [
    {
        id: "no_receipt_discount",
        title: "ร้านค้าเสนอส่วนลด",
        description:
            "ร้านค้าเสนอส่วนลด 300 บาท แต่ไม่สามารถออกใบเสร็จให้ได้",
        choices: [
            {
                id: "accept_discount",
                text: "รับส่วนลดและไม่เอาใบเสร็จ",
                result: {
                    money: 300,
                    score: -10,
                    missingReceipt: true,
                    message:
                        "คุณประหยัดเงินได้ แต่ขาดหลักฐานการใช้จ่าย",
                },
            },
            {
                id: "reject_discount",
                text: "ปฏิเสธและขอใบเสร็จ",
                result: {
                    money: 0,
                    score: 10,
                    missingReceipt: false,
                    message:
                        "คุณเลือกความโปร่งใส แม้ไม่ได้ส่วนลด",
                },
            },
        ],
    },

    {
        id: "coffee_request",
        title: "เพื่อนขอซื้อกาแฟ",
        description:
            "สมาชิกชมรมขอใช้เงินกิจกรรมซื้อกาแฟให้ทีมงาน",
        choices: [
            {
                id: "buy_coffee",
                text: "ซื้อกาแฟให้ทีมงาน",
                result: {
                    money: -900,
                    score: -15,
                    unnecessaryPurchase: true,
                    message:
                        "เป็นค่าใช้จ่ายที่ไม่เกี่ยวข้องกับกิจกรรม",
                },
            },
            {
                id: "deny_coffee",
                text: "ปฏิเสธ",
                result: {
                    money: 0,
                    score: 10,
                    message:
                        "คุณรักษางบประมาณของชมรม",
                },
            },
        ],
    },

    {
        id: "support_water",
        title: "ได้รับการสนับสนุน",
        description:
            "รุ่นพี่บริจาคน้ำดื่มให้กิจกรรมจำนวนหนึ่ง",
        choices: [
            {
                id: "accept_support",
                text: "รับการสนับสนุน",
                result: {
                    money: 800,
                    score: 15,
                    removeNeed: "water",
                    message:
                        "ช่วยลดค่าใช้จ่ายของกิจกรรม",
                },
            },
            {
                id: "reject_support",
                text: "ไม่รับ",
                result: {
                    money: 0,
                    score: 0,
                    message:
                        "ยังต้องใช้งบตามแผนเดิม",
                },
            },
        ],
    },

    {
        id: "lost_receipt",
        title: "ใบเสร็จสูญหาย",
        description:
            "คุณทำใบเสร็จหายระหว่างเดินทางกลับชมรม",
        choices: [
            {
                id: "find_receipt",
                text: "ติดต่อร้านเพื่อขอสำเนา",
                result: {
                    money: -100,
                    score: 10,
                    recoverReceipt: true,
                    message:
                        "เสียเวลาและค่าเดินทาง แต่เอกสารครบ",
                },
            },
            {
                id: "ignore_receipt",
                text: "ปล่อยผ่าน",
                result: {
                    money: 0,
                    score: -20,
                    missingReceipt: true,
                    message:
                        "บัญชีขาดหลักฐานการเบิกจ่าย",
                },
            },
        ],
    },

    {
        id: "sale_event",
        title: "ร้านค้าจัดโปรโมชั่น",
        description:
            "ร้านค้าวัสดุจัดโปรโมชั่นลดราคาอุปกรณ์ 20%",
        choices: [
            {
                id: "buy_sale",
                text: "ซื้อในราคาพิเศษ",
                result: {
                    money: 400,
                    score: 10,
                    message:
                        "คุณบริหารงบประมาณได้อย่างคุ้มค่า",
                },
            },
            {
                id: "ignore_sale",
                text: "ไม่สนใจ",
                result: {
                    money: 0,
                    score: 0,
                    message:
                        "ซื้อสินค้าราคาปกติ",
                },
            },
        ],
    },
];

export const getRandomEvent = () => {
    const index = Math.floor(
        Math.random() * RANDOM_EVENTS.length
    );

    return RANDOM_EVENTS[index];
};