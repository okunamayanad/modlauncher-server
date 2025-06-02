import { SysTray } from "node-systray-v2";
import { Logger } from "../utils/Logger";

interface TrayMenuItem {
  title: string;
  tooltip: string;
  checked: boolean;
  enabled: boolean;
}

interface TrayMenuConfig {
  icon: string;
  title: string;
  tooltip: string;
  items: TrayMenuItem[];
}

interface TrayAction {
  seq_id: number;
  item: TrayMenuItem;
}

enum TrayMenuItems {
  SETTINGS = 0,
  ABOUT = 1,
  EXIT = 2,
}

export class TrayService {
  private static readonly TRAY_ICON_BASE64 =
    "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAGAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  private sysTray: any | null = null;
  private logger = Logger.getInstance();

  constructor() {
    this.initializeTray();
  }

  private initializeTray(): void {
    try {
      const menuConfig = this.createMenuConfig();

      this.sysTray = new SysTray({
        menu: menuConfig,
        debug: false,
        copyDir: true,
      });

      this.setupEventHandlers();
      this.logger.info("System tray initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize system tray:", error);
    }
  }

  private createMenuConfig(): TrayMenuConfig {
    return {
      icon: TrayService.TRAY_ICON_BASE64,
      title: "ModLauncher Server",
      tooltip: "ModLauncher Server Application",
      items: [
        {
          title: "Settings",
          tooltip: "Open settings",
          checked: false,
          enabled: true,
        },
        {
          title: "About",
          tooltip: "About this application",
          checked: false,
          enabled: true,
        },
        {
          title: "Exit",
          tooltip: "Exit the application",
          checked: false,
          enabled: true,
        },
      ],
    };
  }

  private setupEventHandlers(): void {
    if (!this.sysTray) {
      this.logger.warn("Cannot setup event handlers: sysTray is null");
      return;
    }

    this.sysTray.onClick((action: TrayAction) => {
      this.handleTrayAction(action);
    });
  }

  private handleTrayAction(action: TrayAction): void {
    this.logger.debug(`Tray action triggered: ${action.seq_id}`);

    switch (action.seq_id) {
      case TrayMenuItems.SETTINGS:
        this.handleSettings();
        break;
      case TrayMenuItems.ABOUT:
        this.handleAbout();
        break;
      case TrayMenuItems.EXIT:
        this.handleExit();
        break;
      default:
        this.logger.warn(`Unknown tray action: ${action.seq_id}`);
    }
  }

  private handleSettings(): void {
    this.logger.info("Settings requested");
    // TODO: Implement settings dialog logic
    // This could open a configuration window or file
  }

  private async handleAbout(): Promise<void> {
    this.logger.info("About dialog requested");
    // Open the project's GitHub repository in the default web browser
    try {
      const open = (await import('open')).default;
      await open('https://github.com/okunamayanad/modlauncher-server');
    } catch (error) {
      this.logger.error('Failed to open GitHub repository:', error);
    }
  }

  private handleExit(): void {
    this.logger.info("Exit requested from tray");
    this.destroy();
    process.exit(0);
  }

  public updateTooltip(text: string): void {
    if (!this.sysTray) {
      this.logger.warn("Cannot update tooltip: sysTray is null");
      return;
    }

    try {
      // TODO: Implement actual tooltip update when node-systray-v2 supports it
      this.logger.debug(`Tooltip update requested: ${text}`);
    } catch (error) {
      this.logger.error("Failed to update tooltip:", error);
    }
  }

  public updateStatus(serverRunning: boolean, clientCount: number): void {
    const statusText = serverRunning
      ? `ModLauncher Server - Running (${clientCount} clients)`
      : "ModLauncher Server - Stopped";

    this.updateTooltip(statusText);
  }

  public isInitialized(): boolean {
    return this.sysTray !== null;
  }

  public destroy(): void {
    if (!this.sysTray) {
      return;
    }

    try {
      this.sysTray.kill();
      this.sysTray = null;
      this.logger.info("System tray destroyed successfully");
    } catch (error) {
      this.logger.error("Failed to destroy system tray:", error);
    }
  }
}
