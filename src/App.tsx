import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MyPrompts } from "./pages/MyPrompts";
import { PromptEditor } from "./pages/PromptEditor";
import "./index.css";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/my-prompts" replace />} />
            <Route path="/my-prompts" element={<MyPrompts />} />
            <Route path="/prompt-editor/:id?" element={<PromptEditor />} />
            <Route path="*" element={<Navigate to="/my-prompts" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
