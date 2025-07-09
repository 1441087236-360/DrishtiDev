# DrishtiDev - Multi-Viewport Development Environment

DrishtiDev is a powerful web application designed to streamline responsive web development. It allows you to simultaneously preview your web apps across multiple customizable viewports—such as mobile, tablet, and desktop—all in a single, cohesive workspace.

Powered by AI and real-time collaboration features, DrishtiDev is more than just a preview tool; it's an integrated development environment that accelerates your workflow from concept to code.

## ✨ Key Features

-   **Multi-Viewport Preview**: Test your app's responsiveness across various devices like iPhone, iPad, and Desktop, or create your own custom viewports.
-   **Live URL Syncing**: Enter a URL once and see it load across all previews instantly. Navigate in one preview and sync the URL across all others with a single click.
-   **Real-time Collaboration**: Share your entire workspace with teammates via a unique URL. Changes to the URL, previews, and themes are synced in real-time for everyone.
-   **AI-Powered Assistant**:
    -   **Generate Code**: Create new Next.js components from a text prompt.
    -   **Refactor Code**: Improve existing code for readability, performance, or to use modern libraries like shadcn/ui.
    -   **Audit & Critique**: Analyze a live URL for accessibility, performance, and UI/UX issues.
-   **Customizable Workspace**:
    -   **Dynamic Layouts**: Choose from multiple panel layouts (columns, grid, focus modes) and resize them to fit your needs.
    -   **Themes & Wallpapers**: Personalize your workspace with multiple color themes and background wallpapers.
-   **Built-in DevTools**: Activate Eruda DevTools within any preview pane to inspect, debug, and profile your application on the fly.

## 🚀 Tech Stack

DrishtiDev is built with a modern, robust tech stack:

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library**: [shadcn/ui](https://ui.shadcn.com/)
-   **AI Integration**: [Genkit](https://genkit.dev/) (with Google's Gemini models)
-   **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## 🔧 Getting Started

To run DrishtiDev locally, follow these steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/1441087236-360/DrishtiDev.git
cd DrishtiDev
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

This project requires API keys to function. The setup involves creating a `.env.local` file and populating it with keys from Firebase and Google AI.

1.  **Create the file**: Find the `.env.example` file in the project, duplicate it, and rename the copy to `.env.local`.
2.  **Get Your Keys**: Follow the **Database Setup** and **Google AI Key Setup** sections below to get your keys.
3.  **Populate the file**: Paste your keys into your `.env.local` file.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔥 Database Setup (Firebase)

The real-time collaboration feature requires a Firebase project. If you don't have one, follow these steps to create one for free.

1.  **Go to the Firebase Console**: Navigate to [console.firebase.google.com](https://console.firebase.google.com/) and sign in with your Google account.
2.  **Create a Project**:
    *   Click on **"Add project"** or **"Create a project"**.
    *   Give your project a name (e.g., "DrishtiDev-Workspace") and click **Continue**.
    *   You can disable Google Analytics for this project if you wish. It's not required.
    *   Click **"Create project"** and wait for it to be provisioned.
3.  **Add a Web App**:
    *   Once your project is ready, you'll be on the project dashboard.
    *   Click the **Web icon** (`</>`) to add a new web application.
    *   Give your app a nickname (e.g., "DrishtiDev App") and click **"Register app"**.
4.  **Get Your Config Keys**:
    *   After registering, Firebase will show you a `firebaseConfig` object. **These are most of the keys you need.**
    *   Keep this page open, or find these keys again later by going to **Project Settings** (⚙️ icon) > **Your apps** > **SDK setup and configuration**.
    *   Copy the values for `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId` into the corresponding `NEXT_PUBLIC_FIREBASE_*` variables in your `.env.local` file.
5.  **Enable Realtime Database**:
    *   In the main left-hand menu, go to **Build > Realtime Database**.
    *   Click **"Create Database"**.
    *   Choose a location for your database (any location is fine).
    *   Select **"Start in test mode"** for the security rules. This allows the app to work easily for development. Click **Enable**.
6.  **Get Your Database URL**:
    *   After the database is created, you will see its URL at the top (e.g., `https://<your-project-id>-default-rtdb.firebaseio.com`).
    *   Copy this URL and paste it as the value for `NEXT_PUBLIC_FIREBASE_DATABASE_URL` in your `.env.local` file.

## 🤖 Google AI Key Setup (Gemini)

The AI Assistant features are powered by Google's Gemini models.

1.  **Go to Google AI Studio**: Navigate to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2.  **Create API Key**: Click the **"Create API key"** button.
3.  **Copy the Key**: A new key will be generated for you. Copy it.
4.  **Paste into `.env.local`**: Paste this key as the value for the `GOOGLE_API_KEY` variable in your `.env.local` file.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/1441087236-360/DrishtiDev/issues).
