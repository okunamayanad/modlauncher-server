export class Config {
  private static instance: Config;
  private config: Map<string, any> = new Map();

  private constructor() {
    this.loadDefaults();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  private loadDefaults(): void {
    this.config.set("port", process.env.PORT || 3000);
    this.config.set("debug", process.env.DEBUG === "true");
    this.config.set("maxClients", 100);
  }

  public get<T>(key: string, defaultValue?: T): T {
    return this.config.get(key) ?? defaultValue;
  }

  public set(key: string, value: any): void {
    this.config.set(key, value);
  }
}
