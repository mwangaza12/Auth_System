import type { Request, Response } from "express";
import {
  loginService,
  registerService,
  verifyOtpService,
  resendOtpService,
} from "./auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      res.status(400).json({ message: "Email and name are required" });
      return;
    }

    const user = await registerService(email, name);

    res.status(201).json({
      message: "Registered successfully. Check your email for the OTP.",
      userId: user.id,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    await loginService(email);

    res.status(200).json({
      message: "OTP sent to your email.",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    const user = await verifyOtpService(email, otp);

    res.status(200).json({
      message: "Email verified successfully.",
      userId: user.id,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resendOtpController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    await resendOtpService(email);

    res.status(200).json({
      message: "A new OTP has been sent to your email.",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};