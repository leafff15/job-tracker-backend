import type {ApiSuccess, ApiError} from '../types/api.ts';

export function successResponse<T>(data: T): ApiSuccess<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: string, message: string): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}