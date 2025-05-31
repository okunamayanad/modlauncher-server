import type { ServerWebSocket } from 'bun';
import type { WebSocketData } from '../types/WebSocket';
import type { CreateInstanceRequest, LaunchInstanceRequest } from '../types/Instance';
import { BaseController } from './BaseController';
import { Instance } from '../models/Instance';
import { Profile } from '../models/Profile';
import { MinecraftLauncherService } from '../services/MinecraftLauncherService';
import { ResponseHelper } from '../utils/ResponseHelper';

export class InstanceController extends BaseController {
  private launcherService = new MinecraftLauncherService();

  async create(ws: ServerWebSocket<WebSocketData>, data: CreateInstanceRequest): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = new Instance(data);
        const success = await instance.save();
        
        if (!success) {
          throw new Error('Failed to save instance');
        }
        
        return instance.toJSON();
      },
      'instance:created',
      'Failed to create instance'
    );
  }

  async get(ws: ServerWebSocket<WebSocketData>, data: { uuid: string }): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = await Instance.findById(data.uuid);
        if (!instance) {
          throw new Error('Instance not found');
        }
        return instance.toJSON();
      },
      'instance:data',
      'Instance not found'
    );
  }

  async update(ws: ServerWebSocket<WebSocketData>, data: { uuid: string; [key: string]: any }): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = await Instance.findById(data.uuid);
        if (!instance) {
          throw new Error('Instance not found');
        }
        
        const success = await instance.update(data);
        if (!success) {
          throw new Error('Failed to update instance');
        }
        
        return instance.toJSON();
      },
      'instance:updated',
      'Failed to update instance'
    );
  }

  async delete(ws: ServerWebSocket<WebSocketData>, data: { uuid: string }): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = await Instance.findById(data.uuid);
        if (!instance) {
          throw new Error('Instance not found');
        }
        
        const success = await instance.delete();
        if (!success) {
          throw new Error('Failed to delete instance');
        }
        
        return { uuid: data.uuid };
      },
      'instance:deleted',
      'Failed to delete instance'
    );
  }

  async list(ws: ServerWebSocket<WebSocketData>): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instances = await Instance.findAll();
        return instances.map(instance => instance.toJSON());
      },
      'instance:list',
      'Failed to list instances'
    );
  }

  async launch(ws: ServerWebSocket<WebSocketData>, data: LaunchInstanceRequest): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const instance = await Instance.findById(data.instanceUuid);
        if (!instance) {
          throw new Error('Instance not found');
        }

        const profile = await Profile.findById(data.profileUuid);
        if (!profile) {
          throw new Error('Profile not found');
        }

        const result = await this.launcherService.launch(instance, profile, ws);
        return result;
      },
      'instance:launched',
      'Failed to launch instance'
    );
  }

  async stop(ws: ServerWebSocket<WebSocketData>, data: { uuid: string }): Promise<void> {
    await this.handleRequest(
      ws,
      async () => {
        const result = await this.launcherService.stop(data.uuid);
        return result;
      },
      'instance:stopped',
      'Failed to stop instance'
    );
  }
}