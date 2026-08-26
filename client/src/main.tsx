import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { api } from "./api";
import type { User } from "./types";
import { AcceptInvite, Dashboard, Hub, Login, Team } from "./pages";
import "./index.css";
function App() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (localStorage.getItem("mw_token"))
      api
        .me()
        .then(setUser)
        .catch(() => localStorage.removeItem("mw_token"));
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route
        path="/manage"
        element={<Dashboard user={user} setUser={setUser} />}
      />
      <Route path="/team" element={<Team user={user} setUser={setUser} />} />
      <Route
        path="/accept-invite"
        element={<AcceptInvite setUser={setUser} />}
      />
    </Routes>
  );
}
createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
