const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            email,
            password,
            gender,
            age,
            faculty,
            major,
            year,
        } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email},
                    { username: username}
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json ({
                message: "Usesr already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
              username,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                gender,
                age: Number(age),
                faculty,
                major,
                year: Number(year),  
            }
        });

        res.status(201).json ({
            message: "Register success",
            user: newUser,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json ({
            message: "Server error",
        });
    }
};


// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique ({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(400).json({
                message: "Email not found",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json ({
                message: "Wrong password",
            });
        }

        const token = jwt.sign (
            {
                id: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
            message: "Login success",
            token,
            user,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};
