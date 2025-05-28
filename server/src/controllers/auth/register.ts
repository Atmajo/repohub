import { Request, Response } from "express";
import logger from "../../logger/logger";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email, and password are required" });
      return;
    }

    if (await prisma.user.findUnique({ where: { email } })) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error(`Error in register API: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
