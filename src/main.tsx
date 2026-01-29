import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Application entry point - render the app
createRoot(document.getElementById("root")!).render(<App />);
