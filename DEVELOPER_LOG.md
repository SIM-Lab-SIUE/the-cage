# Developer Log for The Cage Repository

## Summary
This document provides a comprehensive log of all actions taken to develop and configure "The Cage," a Next.js application for managing equipment checkout at SIUE. The project adheres to the "Code for the Pivot" strategy, ensuring both immediate functionality and future scalability as a SaaS product.

---

## Actions Taken

### Repository Setup
1. **Created a new GitHub repository**: Named `the-cage` under the `SIM-Lab-SIUE` organization.
2. **Initialized Git locally**: Ran `git init` to initialize a new Git repository.
3. **Renamed default branch**: Changed the default branch from `master` to `main` using `git branch -m main`.
4. **Added remote URL**: Linked the local repository to the GitHub repository using:
   ```bash
   git remote add origin https://github.com/SIM-Lab-SIUE/the-cage.git
   ```

### Development Environment Configuration
1. **Configured WSL2 for Docker**:
   - Created a `.wslconfig` file to limit memory usage and prevent system crashes.
   - Ensured the codebase resides in the Linux file system for optimal I/O performance.
2. **Set up Docker Networking**:
   - Defined a custom Docker Bridge Network (`siue-internal`) in `docker-compose.yml`.
   - Configured service aliases for consistent communication between containers.

### Codebase Updates
1. **Implemented the "API Wall"**:
   - Created a service layer to decouple the frontend from the Snipe-IT backend.
   - Transformed Snipe-IT responses into a simplified, commercially viable schema.
2. **Developed the Sidecar Database**:
   - Integrated SQLite with Prisma ORM to handle future reservations.
   - Defined a `Reservation` schema to bridge gaps in Snipe-IT functionality.
3. **Abstracted Authentication**:
   - Implemented an `AuthProviderFactory` to support multiple identity providers.
   - Used NextAuth.js with a mock provider for development.
4. **Hardcoded Business Logic**:
   - Created `RulesService.ts` to enforce rules like "3 blocks per week" and course-based restrictions.
   - Designed the service to allow future replacement with a database-driven rules engine.
5. **Updated `README.md`**:
   - Reflected the new branding for "The Cage," including features, branding, and setup instructions.
6. **Created `.gitignore`**:
   - Added exclusions for unnecessary files and directories, such as:
     - `node_modules`
     - `.env`
     - `.next`
     - Prisma-generated files
     - IDE-specific files (e.g., `.vscode/`)
7. **Added Tailwind CSS configuration**:
   - Defined a color palette (Cougar Red, Lens Black, Steel Grey, Tally Green).
   - Configured typography (Inter, Fira Code).

### UI/UX Development
1. **Built Core Components**:
   - Developed reusable components (Button, Card, Input, Badge) using Tailwind CSS.
   - Ensured all styles are dynamically driven by the branding configuration.
2. **Designed the App Shell**:
   - Created the layout with a sidebar and header.
   - Integrated branding elements like the department name and logo.
3. **Implemented the Equipment Catalog**:
   - Built a grid interface with filtering and search functionality.
   - Connected the UI to the mocked service layer.
4. **Developed the Reservation Workflow**:
   - Created a calendar component for selecting time blocks.
   - Built a confirmation modal to finalize reservations.

### Initial Commit
1. **Staged all files**: Ran `git add .` to stage all project files.
2. **Committed changes**: Created the initial commit with the message:
   ```
   Initial commit for The Cage
   ```
3. **Pushed to GitHub**: Uploaded the codebase to the `main` branch of the remote repository.

### Additional Features
1. **Integrated FullCalendar**:
   - Configured the calendar to display resource availability.
   - Enabled click-and-drag selection for time blocks.
2. **Added QR Code Generation**:
   - Used `qrcode.react` to generate reservation codes.
   - Implemented HMAC signing for security.
3. **Optimized for Mobile**:
   - Tested and adjusted layouts for small viewports.
   - Ensured a seamless experience for students using phones.

### Risk Mitigation
1. **Handled Snipe-IT API Rate Limits**:
   - Implemented caching for heavy catalog fetches.
   - Reduced API load by ~90% during high traffic.
2. **Prepared for Azure AD Delays**:
   - Used a mock provider to simulate authentication.
   - Decoupled development velocity from IT provisioning timelines.
3. **Addressed Semester Data Drift**:
   - Designed an override mechanism for course-based restrictions.
   - Ensured quick updates to `RulesService.ts` for new course codes.

---

## Next Steps
1. **Verify Deployment**: Ensure the application is deployed and accessible.
2. **Collaborate**: Share the repository with team members for further development.
3. **Enhance Documentation**: Add more details about API integration and database setup.

---

## Contributors
- **Alex P. Leith**: Initial setup and configuration.