# Liwatch Bartering Platform - Frontend

A modern TypeScript/React frontend for a peer-to-peer bartering platform built with **Next.js**, **Tailwind CSS**, and real-time WebSocket communication.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm/yarn/pnpm

### Installation

```bash
git clone https://github.com/omerahmedomi/Liwatch-Bartering-Platform-Frontend.git
cd Liwatch-Bartering-Platform-Frontend
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **STOMP/WebSocket** - Real-time communication
- **JWT** - Authentication

## 🔗 Backend

This frontend requires the backend API to be running. Use the backend from:

📍 **[happyNicky/smart-bartering-platform](https://github.com/happyNicky/smart-bartering-platform)**

Clone and set up the backend repository as per its instructions, then update the environment variables above to match your backend's URL.

## 🌙 Features

- ✅ Real-time bidirectional communication
- ✅ JWT-based authentication
- ✅ Dark/Light mode support
- ✅ Responsive design
- ✅ Error handling with Error Boundaries
- ✅ Toast notifications
- ✅ Smooth animations

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

Open source project.

---

**For issues and contributions, please open an issue or PR on GitHub.**
