import { CONFIG_PUBLIC } from "../public.config.js"

const API_BASE = CONFIG_PUBLIC.swgApi.origin;


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!username || !password) {
    alert("Enter username + password");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      alert("Login failed");
      return;
    }

    location.reload();
  } catch (e) {
    alert(`Error: ${e?.message ?? e}`);
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const r = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    location.reload();
  } catch (e) {
    alert(`Error: ${e?.message ?? e}`);
  }
});

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find(c => c.startsWith(name + "="))
    ?.split("=")[1] ?? null;
}

export function isLoggedIn() {
  return Boolean(getCookie("swg_logged_in"));
}