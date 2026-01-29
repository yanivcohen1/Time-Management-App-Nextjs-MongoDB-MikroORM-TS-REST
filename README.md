# Agile Tasks

A full-stack Agile Tasks application built with Next.js, MikroORM, MongoDB, and Material UI.

## Technologies Used

*   **Framework**: [Next.js 16](https://nextjs.org/) (React Framework)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [MongoDB](https://www.mongodb.com/)
*   **ORM**: [MikroORM v5](https://mikro-orm.io/)
*   **API Layer**: [ts-rest](https://ts-rest.com/) (End-to-end typesafe APIs)
*   **Documentation**: [Swagger UI](https://swagger.io/tools/swagger-ui/) (OpenAPI)
*   **UI Library**: [Material UI (MUI)](https://mui.com/)
*   **State Management**: React Context API
*   **Drag & Drop**: `@hello-pangea/dnd`
*   **Authentication**: JWT (JSON Web Tokens) with `bcryptjs`
*   **Schema Validation**: [Zod](https://zod.dev/)
*   **Testing**:
    *   Unit/Integration: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
    *   End-to-End (E2E): [Cypress](https://www.cypress.io/)
*   **Package Manager**: [pnpm](https://pnpm.io/)

## Features

*   **Main Status Board (Kanban)**: Interactive drag-and-drop board to manage todo statuses (Backlog, Pending, In Progress, Completed).
*   **Track Status**: Comprehensive table view with advanced filtering capabilities (by Title, Status, and Due Date).
*   **Dates by Workload**: Visual breakdown of tasks grouped by their due dates to help manage daily workload.
*   **Authentication**: Secure user authentication system.
*   **Responsive UI**: Clean and modern interface built with Material UI.

## Project Structure

```
todo-app-nextjs/
├── cypress/             # Cypress E2E tests
│   ├── e2e/             # E2E test specifications
│   ├── reports/         # Test reports
│   └── screenshots/     # Screenshots from tests
├── migrations/          # MikroORM database migrations
├── public/              # Static assets
├── scripts/             # Utility scripts (e.g., seeding)
│   └── seed.ts
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── admin/       # Admin views
│   │   ├── api/         # ts-rest API route handlers
│   │   │   ├── docs/    # OpenAPI/Swagger spec generation
│   │   │   └── [[...ts-rest]]/ # Typesafe API endpoints
│   │   ├── api-docs/    # Swagger UI page
│   │   ├── board/       # Kanban board view
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   ├── todos/       # Table view (Track Status)
│   │   └── workload/    # Dates by Workload view
│   ├── components/      # Shared React components
│   ├── context/         # React Context (Auth, Theme)
│   ├── entities/        # MikroORM entities (Todo, User)
│   ├── lib/             # Core utilities, contract definition, and API clients
│   │   ├── api-client.ts # ts-rest frontend client
│   │   ├── contract.ts   # Shared API contract (Zod)
│   │   ├── db.ts         # MikroORM initialization
│   │   ├── schemas.ts    # Zod validation schemas
│   │   └── ...
│   └── styles/          # Global styles and Material UI theme configuration
├── mikro-orm.config.ts  # Database configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies and scripts
├── vitest.config.ts     # Vitest configuration
└── tsconfig.json        # TypeScript configuration
```

## API Documentation

The project uses **ts-rest** to provide end-to-end typesafe APIs and automatically generate OpenAPI documentation.

- **Swagger UI**: Accessible at `/api-docs` when the dev server is running.
- **OpenAPI Spec**: The raw JSON spec is generated at `/api/docs`.

The API contract is defined in [src/lib/contract.ts](src/lib/contract.ts) using **Zod** for schema validation.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [pnpm](https://pnpm.io/)
*   [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
*   MongoDB instance (required only if running without Docker)

---

## Running with Docker (Recommended)

The easiest way to run the application is using Docker Compose. This will set up the Next.js app, a MongoDB database, and automatically seed initial data.

1.  **Start the application**:
    ```powershell
    docker-compose up --build
    ```
2.  **Access the application**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Credentials
The database is automatically seeded with the following users:
*   **User**: `user@todo.dev` / `ChangeMe123!`
*   **Admin**: `admin@todo.dev` / `ChangeMe123!`

### Resetting the Database
To clear the database and re-run the seeder:
```powershell
docker-compose down -v
docker-compose up --build
```

---

## Running Locally

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Configure environment variables:
    *   Ensure [.env.development](.env.development) exists and contains your MongoDB connection string (DATABASE_URL) and JWT_SECRET.

### Database Seeding

To populate the database with initial data (test user and todos):

```bash
pnpm seed:db
```

### Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000` (or the port specified in your output).

### Running Tests

**Unit & Integration Tests (Vitest):**

```bash
pnpm test
```

**End-to-End Tests (Cypress):**

1.  Ensure the development server is running (`pnpm dev`).
2.  Run Cypress tests:
    ```bash
    pnpm test:e2e
    ```

### Linting

Check for code quality issues:

```bash
pnpm lint
```

## Available Scripts

| Script | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server. |
| `pnpm build` | Builds the application for production. |
| `pnpm start` | Starts the production server. |
| `pnpm lint` | Runs ESLint to check for code quality issues. |
| `pnpm test` | Runs unit and integration tests using Vitest. |
| `pnpm test:watch` | Runs unit and integration tests using Vitest in watch mode. |
| `pnpm test:coverage` | Runs unit and integration tests with coverage reporting using Vitest. |
| `pnpm test:e2e` | Runs end-to-end tests using Cypress (headless mode). |
| `pnpm seed:db` | Seeds the database with initial data. |
| `pnpm docker-compose:up` | Starts the application and database with Docker Compose. |
| `pnpm docker-compose:down` | Stops the Docker containers and removes volumes. |
| `pnpm docker-compose:seed` | Manually triggers the database seeder container. |
| `pnpm mikro-orm:create` | Creates a new migration file in `./migrations`. |

## Main Page

<img width="1692" height="1496" alt="image" src="https://github.com/user-attachments/assets/54f149ee-3565-4e59-bc7a-5145bd1d9bf9" />

## Track Status

<img width="2345" height="1680" alt="image" src="https://github.com/user-attachments/assets/612e648f-b663-47be-83f3-2490d7ffb655" />

## Board page

<img width="2369" height="1317" alt="image" src="https://github.com/user-attachments/assets/e95af13c-6489-4bc0-b9c4-b03246c62475" />

## Ligth mode

<img width="2353" height="1681" alt="image" src="https://github.com/user-attachments/assets/59e7c9b1-4f88-4855-8054-3fc223a57bba" />

## Mobile mode

<img width="1118" height="1351" alt="image" src="https://github.com/user-attachments/assets/2ade3bf7-80fa-46b7-8980-40e415415040" />
