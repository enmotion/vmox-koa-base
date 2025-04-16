# vmox-koa-base

This project is a Koa-based Node.js application with support for WebSocket, static file serving, and environment-based configurations. It is designed to be modular and easy to maintain.

---

## Table of Contents

- [vmox-koa-base](#vmox-koa-base)
  - [Table of Contents](#table-of-contents)
  - [Project Structure](#project-structure)
  - [Environment Configuration](#environment-configuration)
  - [Setup Instructions](#setup-instructions)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Available Commands](#available-commands)
    - [Development](#development)
    - [Production](#production)
    - [Testing](#testing)
  - [Development Notes](#development-notes)
  - [Troubleshooting](#troubleshooting)
  - [License](#license)

---

## Project Structure

```
vmox-koa-base/
├── .bin/                # Contains the entry point for the application
├── src/                 # Source code for the application
│   ├── app.ts           # Main Koa application setup
│   ├── use.lib/         # Utility functions
├── public/              # Static files served by the application
├── .env                 # Default environment variables
├── ecosystem.config.js  # PM2 configuration for process management
├── nodemon.json         # Nodemon configuration for development
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

---

## Environment Configuration

The project uses `dotenv` to manage environment variables. Below is a breakdown of the configuration files:

1. **`.env`**: Default environment variables.
   ```
   APP_PORT = 1300
   APP_NAME = koa-base
   APP_VERSION = 0.0.0
   APP_DB_URL = ""
   APP_DB_PW = ""
   ```

2. **Environment-specific files**:
   - `.env.development`: Overrides for development.
   - `.env.production`: Overrides for production.

3. **Environment Variables**:
   - `APP_PORT`: Port on which the application runs.
   - `APP_NAME`: Name of the application.
   - `APP_VERSION`: Application version.
   - `APP_DB_URL`: Database connection URL.
   - `APP_DB_PW`: Database password.

4. **PM2 Configuration**:
   - Located in `ecosystem.config.js`.
   - Configures the application for production with environment variables like `NODE_ENV` and `PORT`.

---

## Setup Instructions

### Prerequisites

- **Node.js**: Version 16 or higher.
- **npm**: Version 7 or higher.
- **TypeScript**: Installed globally (`npm install -g typescript`).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vmox-koa-base.git
   cd vmox-koa-base
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env` and modify as needed.
   - For development, create `.env.development` and `.env.development.local`.

---

## Available Commands

### Development

1. **Start the application in development mode**:
   ```bash
   npm run dev
   ```
   - Uses `nodemon` to watch for file changes.
   - Automatically restarts the server on changes.

2. **Compile TypeScript**:
   ```bash
   npm run build
   ```
   - Compiles the TypeScript files into JavaScript in the `dist/` directory.

### Production

1. **Start the application in production mode**:
   ```bash
   npm start
   ```
   - Runs the compiled JavaScript files from the `dist/` directory.

2. **Run with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```
   - Starts the application using PM2 with the configuration in `ecosystem.config.js`.

3. **Monitor PM2 processes**:
   ```bash
   pm2 monit
   ```

4. **Stop the application**:
   ```bash
   pm2 stop ecosystem.config.js
   ```

### Testing

1. **Run tests** (if applicable):
   ```bash
   npm test
   ```

---

## Development Notes

1. **Static Files**:
   - Static files are served from the `public/` directory.
   - Use the `koa-static` middleware for serving files.

2. **WebSocket Support**:
   - The project includes WebSocket support using `koa-websocket`.

3. **Dynamic Port Allocation**:
   - The application dynamically allocates ports in development mode using the `getAvailablePort` utility.

4. **Error Handling**:
   - Errors during startup or runtime are logged with detailed messages using the `colors` library.

5. **TypeScript Configuration**:
   - The `tsconfig.json` file is configured to skip type checking for `.d.ts` files (`skipLibCheck`).

---

## Troubleshooting

1. **Port Conflicts**:
   - Ensure the port specified in `.env` is not in use.
   - Use the `getAvailablePort` utility to find an open port.

2. **Environment Variables Not Loaded**:
   - Verify the `.env` file exists and is correctly formatted.
   - Check the `dotenv` configuration in `.bin/www.ts`.

3. **PM2 Issues**:
   - Ensure PM2 is installed globally: `npm install -g pm2`.
   - Use `pm2 logs` to view application logs.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.