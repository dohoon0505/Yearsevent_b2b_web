import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";

/**
 * 올해의경조사 — 루트 App
 *
 * 라우트 (요청서 §2 / Figma 0:1):
 *   /            홈 — Hero_intro → Hero_Section + Footer (Figma 100% 재현)
 *   향후 확장   /about /benefits /cases /services /web3 /products /magazine /contact /privacy /terms
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
