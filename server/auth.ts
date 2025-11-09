import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { User, InsertUser, LoginUser } from "@shared/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(userData: InsertUser): Promise<Omit<User, 'password'>> {
  const existingUser = await storage.getUserByUsername(userData.username);
  if (existingUser) {
    throw new Error("Пользователь с таким именем уже существует");
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await storage.createUser({
    ...userData,
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function loginUser(credentials: LoginUser): Promise<Omit<User, 'password'>> {
  const user = await storage.getUserByUsername(credentials.username);
  if (!user) {
    throw new Error("Неверное имя пользователя или пароль");
  }

  const isValid = await verifyPassword(credentials.password, user.password);
  if (!isValid) {
    throw new Error("Неверное имя пользователя или пароль");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
