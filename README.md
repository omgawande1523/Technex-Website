# TNX-26 Frontend

The official frontend application for **TECHNEX 2026–27**, the annual technical festival of St. Vincent Pallotti College of Engineering & Technology, Nagpur.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js (App Router) | React framework |
| React | UI development |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| ESLint | Code quality |

## Project Structure

```text
tnx26_frontend/
├
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   └── page.tsx
│   │   ├── workshops/
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── team/
│   │   │   └── page.tsx
│   │   ├── sponsors/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   
│   │       
│   │
│   ├── components/
│   │   ├── landing/
│   │   ├── contact/
│   │   ├── about/
│   │   ├── events/
│   │   ├── workshops/
│   │   ├── gallery/
│   │   ├── team/
│   │   └── sponsors/
│   │
│   ├── hooks/
│   ├── lib/
│   ├── constants/
│   ├── types/
│   └── utils/
│
├── AGENTS.md
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/NikitaBhushanwar/tnx26_frontend.git
```

### 2. Navigate into the project

```bash
cd tnx26_frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Application Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about` | About Technex |
| `/events` | Events |
| `/workshops` | Workshops |
| `/gallery` | Gallery |
| `/team` | Team |
| `/sponsors` | Sponsors |
| `/contact` | Contact |

## Development Guidelines

1. Keep reusable components inside `src/components`.
2. Organize components by their respective features.
3. Keep route-specific page implementations inside `src/app`.
4. Use TypeScript for components, functions and data structures.
5. Store static assets inside `public`.
6. Keep environment variables and secrets out of Git.
7. Follow the coding instructions defined in `AGENTS.md`.
8. Prefer reusable, modular and maintainable implementations.


```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

## Repository

**GitHub:** https://github.com/NikitaBhushanwar/tnx26_frontend

---