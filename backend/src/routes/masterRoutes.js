const express = require("express");
const router = express.Router();

const {
    getFacultiesWithMajors,
} = require("../controllers/masterController");

router.get("/faculties", getFacultiesWithMajors);
module.exports = router;