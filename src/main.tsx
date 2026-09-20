import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Poster } from "./poster/Poster";
import { Sidebar } from "./ui/Sidebar";
import "./app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="app">
      <Sidebar />
      <Poster />
    </div>
  </StrictMode>,
);
