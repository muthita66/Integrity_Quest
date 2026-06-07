import { Routes, Route } from "react-router-dom";

import AuthPage from "./components/Pages/AuthPage";
import MapPage from "./components/Pages/MapPage";
import PreTestPage from "./components/Pages/PreTestPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/pretest" element={<PreTestPage />} />

    </Routes>
  );
}

export default App;