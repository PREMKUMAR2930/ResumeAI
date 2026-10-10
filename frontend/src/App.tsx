import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { SetupInterview } from "./pages/SetupInterview";
import { InterviewSession } from "./pages/InterviewSession";
import { Results } from "./pages/Results";
import { NotFound } from "./pages/NotFound";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<SetupInterview />} />
            <Route path="/interview/:sessionId" element={<InterviewSession />} />
            <Route path="/results/:sessionId" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
