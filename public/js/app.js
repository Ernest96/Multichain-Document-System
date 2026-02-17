
import { isLoggedIn } from "./auth.js";

const modal = document.getElementById("loginModal");
const modalClose = document.getElementById("loginModalClose");
const modalCancel = document.getElementById("loginCancelBtn");

const openLoginBtn = document.getElementById("openLoginBtn");

const logoutBtn = document.getElementById("logoutBtn");
const loginBtn = document.getElementById("openLoginBtn");

function openModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    const user = document.getElementById("loginUser");
    user?.focus();
}

function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

function wireModal() {
    openLoginBtn?.addEventListener("click", openModal);
    modalClose?.addEventListener("click", closeModal);
    modalCancel?.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
        if (e.target?.dataset?.close) closeModal();
    });
}

function buildAdminUI() {
    const isLoggedInUser = isLoggedIn();

    if (isLoggedInUser) {
        loginBtn.classList.remove('show');
        logoutBtn.classList.add('show');

    } else {
        loginBtn.classList.add('show');
        logoutBtn.classList.remove('show');
    }
}

async function startApp() {
    try {
        wireModal();
        buildAdminUI();
    } catch (err) {
        console.error(err);
    }
}
startApp();