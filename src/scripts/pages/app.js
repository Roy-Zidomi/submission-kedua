import routes from "../routes/routes.js";
import UrlParser from "../routes/url-parser.js";
import { transitionView } from "../utils/view-transition.js";
import { isAuthenticated, removeToken, removeUser } from "../utils/index.js";
import { initNotificationToggle } from "../index.js";
import { idbAddStory } from '../utils/idb.js';
import { syncOfflineStories } from '../utils/sync.js';

class App {
  constructor() {
    console.log("Story App initializing...");
    this._initialAppShell();
  }

  _initialAppShell() {
    this._renderNavigation();
  }

  _renderNavigation() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;

    const authenticated = isAuthenticated();
    let toggleBtn = document.getElementById("toggleNotification");

    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.id = "toggleNotification";
      toggleBtn.className = "btn-notification hidden";
      toggleBtn.textContent = "🔔 Enable Notification";
      nav.appendChild(toggleBtn);
    }

    nav.querySelectorAll(".nav-link").forEach((link) => link.remove());

    if (authenticated) {
      nav.insertAdjacentHTML(
        "afterbegin",
        `
        <a href="#/home" class="nav-link">Home</a>
        <a href="#/create" class="nav-link">Create Story</a>
        <a href="#" id="logoutBtn" class="nav-link">Logout</a>
      `
      );
      toggleBtn.classList.remove("hidden");

      setTimeout(() => {
        import("../index.js").then(({ initNotificationToggle }) => {
          initNotificationToggle();
        });
      }, 200);

      const logoutBtn = document.getElementById("logoutBtn");
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        removeToken();
        removeUser();
        window.location.hash = "#/login";
        this._renderNavigation();
      });
    } else {
      nav.insertAdjacentHTML(
        "afterbegin",
        `
        <a href="#/login" class="nav-link">Login</a>
        <a href="#/register" class="nav-link">Register</a>
      `
      );
      toggleBtn.classList.add("hidden");
    }

    this._updateActiveNavLink();
  }

  _updateActiveNavLink() {
    const currentHash = window.location.hash || "#/";
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === currentHash) {
        link.classList.add("active");
      }
    });
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    console.log("Navigating to:", url);

    const authenticated = isAuthenticated();
    const publicRoutes = ["/login", "/register"];
    const isPublicRoute = publicRoutes.includes(url);

    if (!authenticated && !isPublicRoute) {
      console.log("Not authenticated, redirecting to login");
      window.location.hash = "#/login";
      return;
    }

    if (authenticated && isPublicRoute) {
      console.log("Already authenticated, redirecting to home");
      window.location.hash = "#/home";
      return;
    }

    const page = routes[url];
    if (!page) {
      console.error("Route not found:", url);
      window.location.hash = "#/login";
      return;
    }

    await transitionView(async () => {
      const content = document.getElementById("app-content");
      if (!content) return;

      console.log("Rendering page:", url);
      const pageInstance = new page();
      content.innerHTML = await pageInstance.render();

      if (pageInstance.afterRender) {
        console.log("Running afterRender...");
        await pageInstance.afterRender();
      }

      this._renderNavigation();
      this._updateActiveNavLink();
      window.scrollTo(0, 0);

      console.log("Page rendered successfully");
      setTimeout(() => {
        initNotificationToggle();
      }, 200);
    });
  }
}


async function onSubmitForm() {
  const payload = {
    description: this._description.value,
    createdAt: Date.now(),
  };

  if (!navigator.onLine) {
    // Jika offline, simpan ke IndexedDB
    await idbAddStory(payload);
    alert('Data disimpan offline. Akan dikirim saat online.');
    return;
  }

  // Jika online, kirim langsung ke API
  await fetch(`${Config.BASE_URL}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload),
  });

  alert('Story berhasil dibuat!');
}

console.log("Starting Story App...");
const app = new App();

window.addEventListener("hashchange", () => app.renderPage());
window.addEventListener("load", () => app.renderPage());
export default app;
