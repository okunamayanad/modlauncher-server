# ModLauncher Server

## Architecture Overview

The server is organized into several layers for maintainability and scalability:

### Core Components
- **WebSocketServer**: Main server handling WebSocket connections
- **MessageRouter**: Routes incoming messages to appropriate controllers
- **ClientManager**: Manages connected WebSocket clients

### Controllers
- **ProfileController**: Handles user profile operations
- **InstanceController**: Manages Minecraft instances
- **ModController**: Handles mod search and download operations

### Models
- **Profile**: User authentication profiles
- **Instance**: Minecraft game instances with configurations

### Services
- **DatabaseService**: JSON database management
- **MinecraftLauncherService**: Minecraft launching functionality
- **ModService**: Mod management and Modrinth integration

### Utils
- **Logger**: Centralized logging system
- **ResponseHelper**: WebSocket response utilities
- **ValidationMiddleware**: Request validation
- **PathUtils**: File system path management

## Project Structure

```
src/
├── index.ts                    # Application entry point
├── config/
│   └── Config.ts              # Configuration management
├── core/
│   ├── WebSocketServer.ts     # Main WebSocket server
│   ├── MessageRouter.ts       # Message routing logic
│   └── ClientManager.ts       # Client connection management
├── controllers/
│   ├── BaseController.ts      # Base controller class
│   ├── ProfileController.ts   # Profile operations
│   ├── InstanceController.ts  # Instance operations
│   └── ModController.ts       # Mod operations
├── models/
│   ├── BaseModel.ts          # Base model class
│   ├── Profile.ts            # Profile model
│   └── Instance.ts           # Instance model
├── services/
│   ├── DatabaseService.ts    # Database operations
│   ├── MinecraftLauncherService.ts  # Minecraft launching
│   └── ModService.ts         # Mod management
├── types/
│   ├── WebSocket.ts          # WebSocket type definitions
│   ├── Profile.ts            # Profile type definitions
│   └── Instance.ts           # Instance type definitions
├── utils/
│   ├── Logger.ts             # Logging utilities
│   ├── ResponseHelper.ts     # Response helpers
│   ├── PathUtils.ts          # Path utilities
│   └── ValidationMiddleware.ts # Request validation
└── middleware/
    └── ValidationMiddleware.ts # Input validation
```

## Message Types

### Profile Operations
- `profile:create` - Create a new profile
- `profile:get` - Get profile by UUID
- `profile:update` - Update existing profile
- `profile:delete` - Delete profile
- `profile:list` - List all profiles

### Instance Operations
- `instance:create` - Create new Minecraft instance
- `instance:launch` - Launch Minecraft instance
- `instance:get` - Get instance details
- `instance:update` - Update instance configuration
- `instance:delete` - Delete instance
- `instance:list` - List all instances

### Mod Operations
- `mod:search` - Search for mods on Modrinth
- `mod:download` - Download mod from Modrinth

## Installation

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Configuration

The server uses environment variables for configuration:

- `PORT` - Server port (default: 3000)
- `DEBUG` - Enable debug logging (default: false)

## WebSocket API

Connect to `ws://localhost:3000` and send JSON messages:

```javascript
// Create a profile
{
  "type": "profile:create",
  "payload": {
    "username": "player123",
    "accessToken": "token_here"
  }
}

// Create an instance
{
  "type": "instance:create",
  "payload": {
    "name": "My Modpack",
    "versionNumber": "1.20.1",
    "versionType": "release",
    "modLoader": "Forge",
    "allocatedMemory": { "min": 2048, "max": 4096 },
    "resolution": { "width": 1920, "height": 1080 }
  }
}

// Launch an instance
{
  "type": "instance:launch",
  "payload": {
    "instanceUuid": "uuid-here",
    "profileUuid": "profile-uuid-here"
  }
}
```

## Response Format

All responses follow this format:

```javascript
{
  "type": "response_type",
  "payload": { /* response data */ },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Error responses:

```javascript
{
  "type": "error",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
}
```

## Extending the Server

### Adding New Controllers

1. Create a new controller in `src/controllers/`
2. Extend `BaseController`
3. Register routes in `MessageRouter`

### Adding New Models

1. Create model in `src/models/`
2. Extend `BaseModel`
3. Define TypeScript interfaces in `src/types/`

### Adding New Services

1. Create service in `src/services/`
2. Inject into controllers as needed
3. Use singleton pattern for shared services

## Development Guidelines

- Use TypeScript for type safety
- Follow the established architecture patterns
- Add proper error handling and logging
- Validate input data using ValidationMiddleware
- Write comprehensive tests for new features
- Keep controllers thin - business logic belongs in services
- Use the existing response helpers for consistency

## Security Considerations

- Validate all incoming WebSocket messages
- Implement proper authentication for production
- Sanitize file paths to prevent directory traversal
- Rate limit connections and messages
- Use HTTPS/WSS in production