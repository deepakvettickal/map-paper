import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useEffect } from "react";
import { Poster } from "./poster/Poster";
import { Sidebar } from "./ui/Sidebar";
import { usePoster } from "./store";
import "./app.css";

function App() {
  const uiTheme = usePoster((s) => s.uiTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = uiTheme;
  }, [uiTheme]);
  return (
    <div className="app">
      <Sidebar />
      <Poster />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
