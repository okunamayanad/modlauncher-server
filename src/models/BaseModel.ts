import { DatabaseService } from "../services/DatabaseService";
import crypto from "crypto";

export abstract class BaseModel {
  protected static db = DatabaseService.getInstance();
  public uuid: string;
  public createdAt: Date;
  public updatedAt?: Date;

  constructor() {
    this.uuid = crypto.randomUUID();
    this.createdAt = new Date();
  }

  abstract save(): Promise<boolean>;
  abstract delete(): Promise<boolean>;

  protected updateTimestamp(): void {
    this.updatedAt = new Date();
  }
}
