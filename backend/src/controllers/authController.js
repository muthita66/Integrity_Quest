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

        const existingUser = await prisma.users.findFirst({
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

        // สร้าง user
        const user = await prisma.users.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role_id: 1, // student
                created_at: new Date(),
                last_login: new Date(), 
            },
        });

        // สร้าง student
        await prisma.students.create({
            data: {
                first_name,
                last_name,
                gender,
                birth_year: new Date().getFullYear() - Number(age),
                entry_year: Number(year),
                major_id: Number(major),

                users: {
                connect: {
                    id: user.id
                }
                }
            }
        });

        res.status(201).json ({
            message: "Register success",
            user: user,
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

        const user = await prisma.users.findFirst ({
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
