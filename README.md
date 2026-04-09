# ATHLON - College Sports Management

A modern, responsive college sports management dashboard built with React, Vite, and Tailwind CSS. Featuring glassmorphism, Framer Motion animations, and a rich dark mode UI.

## How to run the project
1. Ensure Node.js is installed on your computer.
2. Open terminal in the `athlon` directory.
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the development server.
5. Open the provided localhost link in your browser (usually `http://localhost:5173`).

## Where to edit data easily
All initial mock data (Teams, Events, Results) is stored cleanly in a single file:
**`src/data/mockData.js`**

You can easily edit team names, add new events, or update event results in this file. The `useData` hook will automatically load this data into your browser's local storage. If you want to reset your data to exactly what's in `mockData.js` after making changes in the Admin panel, simply clear your browser's Local Storage.

## How to access the Admin panel
1. Start the application and navigate to the `/admin` route (e.g., `http://localhost:5173/admin`).
2. The password to authenticate is: **admin123**
3. From the admin dashboard, you can quickly toggle the statuses of events (Upcoming <-> Completed).
