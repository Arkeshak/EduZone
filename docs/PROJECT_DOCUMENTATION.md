# Project Documentation

## Architecture Overview
EduZone follows a decoupled Client-Server architecture.

### Backend (Node.js/Express)
- **MVC Pattern**: Separated Models (Sequelize), Controllers, and Routes.
- **Authentication**: JWT with secure refresh token rotation stored in the database.
- **Security**: Helmet, Rate Limiting, and custom XSS sanitization.

### Frontend (React)
- **Atomic Components**: Reusable UI components powered by Shadcn/UI.
- **Centralized Services**: All API communication is abstracted in the `services/` layer.
- **State Management**: React Context API for authentication and session persistence.

## Roles & Permissions
- **Teacher**: Submits welfare requests and manages educational resources.
- **Principal**: Reviews and approves requests at the school level.
- **Donor**: Browses and funds verified welfare requests.
- **ZEO (Zonal Education Officer)**: Final approval authority and fund transfer manager.
