import type { ServerWebSocket } from "bun";
import type { WebSocketData } from "../types/WebSocket";
import { ResponseHelper } from "../utils/ResponseHelper";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "number" | "boolean" | "array" | "object";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: any[];
}

export class ValidationMiddleware {
  static validate(
    ws: ServerWebSocket<WebSocketData>,
    data: any,
    rules: ValidationRule[]
  ): boolean {
    for (const rule of rules) {
      const value = data[rule.field];

      // Check required
      if (rule.required && (value === undefined || value === null)) {
        ResponseHelper.sendError(ws, `Field '${rule.field}' is required`);
        return false;
      }

      // Skip further validation if field is not provided and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (rule.type && typeof value !== rule.type) {
        ResponseHelper.sendError(
          ws,
          `Field '${rule.field}' must be of type ${rule.type}`
        );
        return false;
      }

      // Check string length
      if (rule.type === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          ResponseHelper.sendError(
            ws,
            `Field '${rule.field}' must be at least ${rule.minLength} characters long`
          );
          return false;
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          ResponseHelper.sendError(
            ws,
            `Field '${rule.field}' must be at most ${rule.maxLength} characters long`
          );
          return false;
        }
      }

      // Check number range
      if (rule.type === "number") {
        if (rule.min !== undefined && value < rule.min) {
          ResponseHelper.sendError(
            ws,
            `Field '${rule.field}' must be at least ${rule.min}`
          );
          return false;
        }
        if (rule.max !== undefined && value > rule.max) {
          ResponseHelper.sendError(
            ws,
            `Field '${rule.field}' must be at most ${rule.max}`
          );
          return false;
        }
      }

      // Check enum values
      if (rule.enum && !rule.enum.includes(value)) {
        ResponseHelper.sendError(
          ws,
          `Field '${rule.field}' must be one of: ${rule.enum.join(", ")}`
        );
        return false;
      }
    }

    return true;
  }
}
