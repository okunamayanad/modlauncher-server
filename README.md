# ModLauncher Server

The server-side component of ModLauncher, enabling seamless mod management for Minecraft.

## Overview

ModLauncher consists of two parts:

- **Server**: This application, handling backend operations.
- **Client**: A browser extension for managing your instances, profiles, and installing mods directly from [Modrinth](https://modrinth.com).

For the client-side extension, visit the [ModLauncher Client Repository](https://github.com/okunamayanad/modlauncher-client).

## Installation

To set up the ModLauncher Server, follow these steps:

### Option 1: Use Precompiled Releases

1. Download the latest release from the [Releases Page](https://github.com/yourusername/modlauncher-server/releases).
2. Extract the downloaded archive and navigate to the extracted folder:

```bash
cd modlauncher-server
```

3. Start the server:

```bash
bun start
```

### Option 2: Build from Source

1. Ensure you have [Bun](https://bun.sh) installed on your system.
2. Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/yourusername/modlauncher-server.git
cd modlauncher-server
```

3. Install dependencies and build the project:

```bash
bun install
bun build
```

4. Start the server:

```bash
bun start
```

That's it! The server should now be running and ready to handle mod management tasks.
