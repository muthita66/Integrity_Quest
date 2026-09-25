const express = require("express");
const cors = require("cors");
require("dotenv").config();

const quizRoutes = require("./routes/quiz");
const userProgressRoutes = require("./routes/userProgressRoutes");

const profileRoutes = require("./routes/profileRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const activityRoutes = require("./routes/activityRoutes");

const authRoutes = require("./routes/authRoutes");
const masterRoutes = require("./routes/masterRoutes");

const unitContentRoutes = require("./routes/unitContent");
const introDialogRoutes = require("./routes/introDialog");
const questionRoutes = require("./routes/question");
const gameStoryRoutes = require("./routes/gameStory");
const gamePlayRoutes = require("./routes/gamePlayRoutes");

const bubbleRoutes = require("./routes/bubbleRoutes");
const finalLevelRoutes = require("./routes/finalLevelRoutes");

// unit 2
const levelItemRoutes = require("./routes/levelItem");
const levelHintRoutes = require("./routes/levelHint");
const comparisonQuestionRoutes = require("./routes/comparisonQuestion");
const hintMinigameRoutes = require("./routes/hintMinigame");

// unit 3
const receiptHuntRoutes = require("./routes/receiptHuntRoutes");
const moneyGameRoutes = require("./routes/moneyGameRoutes");

// Result Page
const levelResultRoutes = require("./routes/levelResultRoutes");

console.log("Game Play Routes Loaded");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/profile", profileRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/activity", activityRoutes); // นับเวลาใช้งาน (heartbeat)

app.use("/api", quizRoutes);
app.use("/api/user-progress", userProgressRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/unitContent", unitContentRoutes);
app.use("/api/introDialog", introDialogRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/gameStory", gameStoryRoutes);
app.use("/api/game-play", gamePlayRoutes);

app.use("/api/bubbles", bubbleRoutes);
app.use("/api/final-level", finalLevelRoutes);

// unit 2 level1
app.use("/api/levelItem", levelItemRoutes);
app.use("/api/levelHint", levelHintRoutes);
app.use("/api/comparisonQuestion", comparisonQuestionRoutes);
app.use("/api/hintMinigame", hintMinigameRoutes);

// unit 3 level1
app.use("/api/receipt-hunt", receiptHuntRoutes);
app.use("/api/money-game", moneyGameRoutes);

app.use("/api/level-result", levelResultRoutes);

app.get("/", (req, res) => {
    res.send("APT running...");
})

const port = process.env.port || 5000;

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// พอร์ตถูกใช้อยู่ (เช่น server ตัวเก่ายังไม่ปิด) → แจ้งให้เห็นชัด ๆ
// แทนที่จะเงียบแล้ว nodemon ขึ้น "clean exit"
server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(
            `❌ Port ${port} ถูกใช้อยู่ — ปิดตัวเก่าก่อน: netstat -ano | findstr :${port} แล้ว taskkill /PID <เลข> /F`
        );
    } else {
        console.error("Server error:", error);
    }
    process.exit(1);
});