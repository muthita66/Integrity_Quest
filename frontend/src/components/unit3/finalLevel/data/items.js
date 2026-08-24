export const START_BUDGET = 10000;


// =========================
// REQUIRED ITEMS
// ของจำเป็นที่ต้องซื้อให้ครบ
// =========================

export const REQUIRED_ITEMS = [
    "paint",
    "food",
    "water",
    "medicine",
    "trash",
];


// =========================
// CATEGORY BUDGET
// งบจำกัดแต่ละหมวด
// =========================

export const INITIAL_CATEGORY_BUDGET = {

    "วัสดุ": 2500,

    "อาหาร": 3500,

    "สุขภาพ": 1000,

    "อุปกรณ์": 1500,

    "ฟุ่มเฟือย": 0,

};



// =========================
// ITEMS
// =========================

export const ITEMS = [

    // =====================
    // NEED
    // =====================


    {
        id: "paint",
        name: "สีทาผนัง",
        price: 2000,
        type: "need",
        category: "วัสดุ",
        maxPurchase: 2,
        description:
            "ใช้สำหรับปรับปรุงพื้นที่กิจกรรม",
        icon: "🎨",
    },


    {
        id: "brush",
        name: "แปรงทาสี",
        price: 400,
        type: "need",
        category: "วัสดุ",
        maxPurchase: 5,
        description:
            "อุปกรณ์สำหรับทาสี",
        icon: "🖌️",
    },



    {
        id: "food",
        name: "อาหารกลางวัน",
        price: 2500,
        type: "need",
        category: "อาหาร",
        maxPurchase: 5,
        description:
            "อาหารสำหรับผู้เข้าร่วมกิจกรรม",
        icon: "🍱",
    },



    {
        id: "water",
        name: "น้ำดื่ม",
        price: 800,
        type: "need",
        category: "อาหาร",
        maxPurchase: 10,
        description:
            "น้ำดื่มสำหรับสมาชิกค่าย",
        icon: "💧",
    },



    {
        id: "medicine",
        name: "ชุดปฐมพยาบาล",
        price: 600,
        type: "need",
        category: "สุขภาพ",
        maxPurchase: 3,
        description:
            "อุปกรณ์ปฐมพยาบาลเบื้องต้น",
        icon: "🩹",
    },



    {
        id: "trash",
        name: "ถุงขยะ",
        price: 200,
        type: "need",
        category: "อุปกรณ์",
        maxPurchase: 10,
        description:
            "สำหรับจัดการขยะภายในกิจกรรม",
        icon: "🗑️",
    },



    {
        id: "gloves",
        name: "ถุงมือ",
        price: 500,
        type: "need",
        category: "อุปกรณ์",
        maxPurchase: 10,
        description:
            "ใช้สำหรับทำความสะอาด",
        icon: "🧤",
    },



    {
        id: "rope",
        name: "เชือก",
        price: 300,
        type: "need",
        category: "อุปกรณ์",
        maxPurchase: 5,
        description:
            "ใช้สำหรับกิจกรรมภาคสนาม",
        icon: "🪢",
    },





    // =====================
    // WANT
    // กับดักการใช้เงิน
    // =====================
    {
        id: "speaker",
        name: "ลำโพง Bluetooth",
        price: 2000,
        type: "want",
        category: "ฟุ่มเฟือย",
        maxPurchase: 2,
        description:
            "เพิ่มความบันเทิง แต่ไม่จำเป็น",
        icon: "🔊",
    },



    {
        id: "snack",
        name: "ขนม",
        price: 600,
        type: "want",
        category: "ฟุ่มเฟือย",
        maxPurchase: 5,
        description:
            "ของว่างเพิ่มเติม",
        icon: "🍪",
    },



    {
        id: "light",
        name: "ไฟตกแต่ง",
        price: 1500,
        type: "want",
        category: "ฟุ่มเฟือย",
        maxPurchase: 2,
        description:
            "ตกแต่งสถานที่",
        icon: "💡",
    },



    {
        id: "doll",
        name: "ตุ๊กตาตกแต่ง",
        price: 500,
        type: "want",
        category: "ฟุ่มเฟือย",
        maxPurchase: 3,
        description:
            "ของตกแต่งเพิ่มเติม",
        icon: "🧸",
    },

];




// =========================
// FIND ITEM
// =========================

export const getItemById = (id) => {

    return ITEMS.find(
        item => item.id === id
    );

};