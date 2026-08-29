import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { RegisterBody, LoginBody, RefreshTokenBody } from './auth.validation.js';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterBody);
  res.status(201).json({
    success: true,
    data: result,
  });
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginBody);
  res.status(200).json({
    success: true,
    data: result,
  });
});


export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body as RefreshTokenBody);
  res.status(200).json({
    success: true,
    data: result,
  });
});


export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});
