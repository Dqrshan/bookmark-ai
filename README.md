# AI Bookmark Analyzer

A fast, intelligent, and beautifully designed web application that transforms your exported browser bookmarks into an AI-powered searchable library. 

Built with **Next.js 15 (React 19)**, **Tailwind CSS v4**, **Shadcn UI**, and the **NVIDIA NIM API** (Llama 3.1 70B).

## Features

- **Semantic AI Search**: Ask plain English questions like *"suggest me some 3d icon websites"*, and the AI engine will instantly scan your parsed bookmark titles and URLs to return only the most relevant hits.
- **Auto-Categorization**: Bookmarks are automatically parsed, scrubbed of bloat, and grouped into meaningful categories using AI semantic analysis upon upload.
- **Privacy First via Dropzone**: Due to browser security restrictions, apps cannot directly access your locally saved bookmarks. We use a drag-and-drop zone that accepts raw `.html` export files from Chrome, Firefox, or Safari, ensuring you only upload what you want to.
- **Mobile Responsive UI**: A fully responsive sidebar layout that collapses into a native drawer on smaller devices, allowing you to search on the go.
- **Lighting Fast Iterations**: Uses the `meta/llama-3.1-70b-instruct` model optimized on NVIDIA's NIM infrastructure for ultra-low latency inference.

## Prerequisites

- Node.js 18+
- An NVIDIA NIM API Key (Sign up and get an API key at [build.nvidia.com](https://build.nvidia.com/explore/discover))

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/bookmark-ai.git
   cd bookmark-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your NVIDIA API key:
   ```env
   NVIDIA_NIM_API_KEY=your_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:** Navigate to [http://localhost:3000](http://localhost:3000)

## How to Export Your Bookmarks

1. **Google Chrome / Brave:** Open the Bookmark Manager (`Ctrl+Shift+O` / `Cmd+Option+B`), click the three dots menu in the top right, and select **Export Bookmarks**.
2. **Mozilla Firefox:** Press `Ctrl+Shift+O` / `Cmd+Shift+O` to open the Library window, click the "Import and Backup" button, and choose **Export Bookmarks to HTML**.
3. **Safari:** Click `File` in the top menu bar, and select **Export Bookmarks..**.

Once exported, simply drag and drop the `.html` file into the AI Bookmark Analyzer start screen!

## Built With

- [Next.js](https://nextjs.org/) - React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS
- [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- [NVIDIA NIM API](https://developer.nvidia.com/nim) - Enterprise-grade AI inference
