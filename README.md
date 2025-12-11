# The Cage

**SIUE Mass Communications Equipment Checkout System**

> *Secure. Reserve. Create.*

The Cage is a Next.js web application designed for the Broadcast Engineers and Mass Communications students at Southern Illinois University Edwardsville. It streamlines the process of reserving, checking out, and managing production equipment.

## Features

- **Digital Catalog**: Browse the full inventory of cameras, audio gear, and lighting.
- **Real-Time Reservations**: Check availability and book gear instantly.
- **Snipe-IT Sync**: Seamless integration with the Snipe-IT asset management backend.
- **Mobile Friendly**: Optimized for students checking out gear on the go.

## Branding & Design

The application utilizes a high-contrast "Darkroom" theme suitable for editing environments.

- **App Name**: The Cage
- **Primary Color**: SIUE Red (`#CC0000`)
- **Font Family**: Inter / Sans-serif

## Project Structure

- `src/app`: Main application logic (Pages & Components).
- `src/services`: API services and Snipe-IT integration logic.
- `prisma/`: Database schema and generated types.
- `public/`: Static assets (Logos, placeholders).

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Snipe-IT API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd greenfield-refactor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env` file in the root directory and add the following:
```
SNIPEIT_API_URL=<your-snipeit-api-url>
SNIPEIT_API_KEY=<your-snipeit-api-key>
```

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for deployment instructions.

## License

This project is licensed under the MIT License.
