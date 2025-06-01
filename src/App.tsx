import "./App.css";

import { HashRouter, Route, Routes } from "react-router";

import Case1 from "./Case1";
import Case2 from "./Case2";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/case1" element={<Case1 />} />
        <Route path="/case2" element={<Case2 />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
