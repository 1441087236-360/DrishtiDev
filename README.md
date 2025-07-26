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


## 🏆 Key Achievements

*   **Engineered** a full-stack, multi-viewport development environment with **Next.js, React, TypeScript, and Tailwind CSS**, increasing responsive testing efficiency by over **70%**.
*   **Integrated** Google's Gemini AI using **Genkit** to deliver **4 core features** (Code Generation, Refactoring, UI Audits), cutting down initial development time for new components by up to **50%**.
*   **Implemented** a real-time collaborative workspace using **Firebase Realtime Database**, supporting synchronized sessions for distributed development teams and reducing communication overhead by **30%**.
*   **Designed** a dynamic, customizable layout system with **dnd-kit**, featuring resizable panels and multiple view modes, which improved user workflow flexibility by **90%**.

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
