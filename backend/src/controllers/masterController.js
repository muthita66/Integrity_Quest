const prisma = require("../lib/prisma");

exports.getFacultiesWithMajors = async (req, res) => {
  try {
    const faculties = await prisma.faculties.findMany({
      include: {
        majors: true,
      },
    });

    res.json(faculties);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};