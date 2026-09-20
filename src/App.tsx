/**
 * Main App Component
 * React Router integration with lazy-loaded routes and global Life Recap modal
 */

import { lazy, Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Navbar } from "./components/Navbar";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { LifeRecapModal } from "./components/LifeRecapModal";
import { useReceipts } from "./hooks/useReceipts";
import "./App.css";

// Lazy load route components for code splitting
const Landing = lazy(() => import("./pages/Landing").then((module) => ({ default: module.Landing })));
const Explore = lazy(() => import("./pages/Explore").then((module) => ({ default: module.Explore })));
const Timeline = lazy(() => import("./pages/Timeline").then((module) => ({ default: module.Timeline })));
const Story = lazy(() => import("./pages/Story").then((module) => ({ default: module.Story })));
const Connections = lazy(() => import("./pages/Connections").then((module) => ({ default: module.Connections })));

function AppRoutes() {
  const { receipts, moments, chapters, loading, error } = useReceipts();
  const [showRecap, setShowRecap] = useState(false);

  if (loading) {
    return <LoadingScreen message="Loading your archive..." />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/explore"
          element={
            <div className="min-h-screen bg-[#05070B]">
              <Navbar onOpenRecap={() => setShowRecap(true)} />
              <main>
                <Suspense fallback={<LoadingScreen />}>
                  <Explore receipts={receipts} moments={moments} chapters={chapters} />
                </Suspense>
              </main>
            </div>
          }
        />
        <Route
          path="/timeline"
          element={
            <div className="min-h-screen bg-[#05070B]">
              <Navbar onOpenRecap={() => setShowRecap(true)} />
              <main>
                <Suspense fallback={<LoadingScreen />}>
                  <Timeline receipts={receipts} moments={moments} chapters={chapters} />
                </Suspense>
              </main>
            </div>
          }
        />
        <Route
          path="/story"
          element={
            <div className="min-h-screen bg-[#05070B]">
              <Navbar onOpenRecap={() => setShowRecap(true)} />
              <main>
                <Suspense fallback={<LoadingScreen />}>
                  <Story chapters={chapters} />
                </Suspense>
              </main>
            </div>
          }
        />
        <Route
          path="/connections"
          element={
            <div className="min-h-screen bg-[#05070B]">
              <Navbar onOpenRecap={() => setShowRecap(true)} />
              <main>
                <Suspense fallback={<LoadingScreen />}>
                  <Connections moments={moments} receipts={receipts} chapters={chapters} />
                </Suspense>
              </main>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <LifeRecapModal
        receipts={receipts}
        moments={moments}
        isOpen={showRecap}
        onClose={() => setShowRecap(false)}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
