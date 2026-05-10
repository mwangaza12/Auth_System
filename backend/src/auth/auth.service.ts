import { prisma } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { sendOtpEmail } from "../middlewares/googleMailer";

// ---- REGISTER ----
export const registerService = async (email: string, name: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const user = await prisma.user.create({
    data: { email, name },
  });

  await generateAndSaveOtp(user.id, user.email);

  return user;
};

// ---- LOGIN ----
export const loginService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (!user.isVerified) throw new Error("Email not verified. Check your inbox for the OTP");

  await generateAndSaveOtp(user.id, user.email);

  return user;
};

// ---- VERIFY OTP ----
export const verifyOtpService = async (email: string, inputOtp: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { otpVerification: true },
  });

  if (!user || !user.otpVerification) throw new Error("OTP not found. Please request a new one");

  const record = user.otpVerification;

  // Check expiry
  if (record.expiresAt < new Date()) {
    await prisma.otpVerification.delete({ where: { userId: user.id } });
    throw new Error("OTP has expired. Please request a new one");
  }

  // Check attempts
  if (record.attempts >= 5) {
    throw new Error("Too many failed attempts. Please request a new OTP");
  }

  // Verify OTP
  const isValid = await bcrypt.compare(inputOtp, record.otp);
  if (!isValid) {
    await prisma.otpVerification.update({
      where: { userId: user.id },
      data: { attempts: { increment: 1 } },
    });
    throw new Error(`Invalid OTP. ${4 - record.attempts} attempts remaining`);
  }

  // Success — mark verified and delete OTP
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });
  await prisma.otpVerification.delete({ where: { userId: user.id } });

  return user;
};

// ---- RESEND OTP ----
export const resendOtpService = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("Email is already verified");

  await generateAndSaveOtp(user.id, user.email);

  return user;
};

// ---- HELPER: Generate, Save & Email OTP ----
const generateAndSaveOtp = async (userId: string, email: string) => {
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const hashed = await bcrypt.hash(rawOtp, 10);

  await prisma.otpVerification.upsert({
    where: { userId },
    update: {
      otp: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      attempts: 0,
      createdAt: new Date(),
    },
    create: {
      userId,
      otp: hashed,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendOtpEmail(email, rawOtp);
};