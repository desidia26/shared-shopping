# Shared Shopping List

This is a shared shopping list application. It allows multiple users to create, share, and manage shopping lists in real time. The application is split into two parts: the API and the UI.

## API

The API is a Node.js application that uses PostgreSQL for data storage. It provides endpoints for managing users, shopping lists, and items within those lists.

The API code is located in the `api/` directory. The main entry point is `index.ts`. Database operations are handled in `api/dal/db.ts`.

To run the API locally, you need to have Node.js and PostgreSQL installed. You can then run npm install to install the dependencies, and npm start to start the server. The server will run on port `8000` by default.

The API is also configured to be deployed on Fly.io. The configuration for this is in `api/fly.toml`.

## UI

The UI is a React Native application. It communicates with the API to display and manage the shopping lists.

The UI code is located in the ui/ directory. The main entry point is `App.tsx`. API calls are made in `ui/services/api.ts`.

To run the UI locally, you need to have Node.js and Expo installed. You can then run npm install to install the dependencies, and npm start to start the Expo server. The server will run on port 19006 by default.

The UI is also configured to be deployed on Fly.io. The configuration for this is in `ui/fly.toml`.

## Docker

Both the API and the UI can be run in Docker. The Dockerfiles for the API and the UI are located in `api/Dockerfile` and `ui/Dockerfile` respectively.

## Environment Variables

Both the API and the UI use environment variables for configuration. These are stored in .env.local and .env.production files in the respective directories. The API uses these variables to configure the database connection, and the UI uses them to configure the API URL.

## Database

The database schema is defined in api/dal/db.ts. The initial database setup is done in db/init.sql.

## Running locally

```sh
docker-compose up
```

This will start the API and the UI in Docker containers. The API will be available at `http://localhost:8000` and the UI will be available at `http://localhost:3000`

Default login: `admin:admin`