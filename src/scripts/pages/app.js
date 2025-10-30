import routes from '../routes/routes.js';
import UrlParser from '../routes/url-parser.js';
import { transitionView } from '../utils/view-transition.js';
import { isAuthenticated, removeToken, removeUser, getUser } from '../utils/index.js';

class App {
  constructor() {
    console.log('Story App initializing...');
    this._initialAppShell();
  }

  _initialAppShell() {
    this._renderNavigation();
  }

  _renderNavigation() {
    const nav = document.getElementById('mainNav');
    
    if (!nav) {
      console.error('Navigation element not found!');
      return;
    }

    const authenticated = isAuthenticated();

    if (authenticated) {
      const user = getUser();
      nav.innerHTML = `
        <a href="#/home" class="nav-link">Home</a>
        <a href="#/create" class="nav-link">Create Story</a>
        <a href="#" id="logoutBtn" class="nav-link" aria-label="Logout">Logout</a>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this._handleLogout();
        });
      }
    } else {
      nav.innerHTML = `
        <a href="#/login" class="nav-link">Login</a>
        <a href="#/register" class="nav-link">Register</a>
      `;
    }

    // Update active nav link
    this._updateActiveNavLink();
  }

  _updateActiveNavLink() {
    const currentHash = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === currentHash) {
        link.classList.add('active');
      }
    });
  }

  _handleLogout() {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      removeToken();
      removeUser();
      window.location.hash = '#/login';
      this._renderNavigation();
    }
  }

  async renderPage() {
    try {
      const url = UrlParser.parseActiveUrlWithCombiner();
      console.log('Navigating to:', url);
      
      // Check authentication
      const authenticated = isAuthenticated();
      const publicRoutes = ['/login', '/register'];
      const isPublicRoute = publicRoutes.includes(url);

      // Redirect logic
      if (!authenticated && !isPublicRoute) {
        console.log('Not authenticated, redirecting to login');
        window.location.hash = '#/login';
        return;
      }

      if (authenticated && isPublicRoute) {
        console.log('Already authenticated, redirecting to home');
        window.location.hash = '#/home';
        return;
      }

      // Get page component
      const page = routes[url];
      
      if (!page) {
        console.error('Route not found:', url);
        window.location.hash = '#/login';
        return;
      }

      // Render with transition
      await transitionView(async () => {
        const content = document.getElementById('app-content');
        
        if (!content) {
          console.error('Content element not found!');
          return;
        }
        
        // Render page
        console.log('Rendering page:', url);
        const pageInstance = new page();
        content.innerHTML = await pageInstance.render();
        
        // Call afterRender if exists
        if (pageInstance.afterRender) {
          console.log('Running afterRender...');
          await pageInstance.afterRender();
        }

        // Update navigation
        this._updateActiveNavLink();
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        console.log('Page rendered successfully');
      });
    } catch (error) {
      console.error('Error rendering page:', error);
      const content = document.getElementById('app-content');
      if (content) {
        content.innerHTML = `
          <div class="auth-container">
            <h2 style="color: #ef4444;">Error Loading Page</h2>
            <p>Something went wrong. Please refresh the page.</p>
            <p style="color: #64748b; font-size: 0.875rem;">${error.message}</p>
            <button onclick="window.location.reload()" class="btn">Refresh Page</button>
          </div>
        `;
      }
    }
  }
}

// Initialize app
console.log('Starting Story App...');
const app = new App();

// Listen to hash change
window.addEventListener('hashchange', () => {
  console.log('Hash changed:', window.location.hash);
  app.renderPage();
});

// Listen to page load
window.addEventListener('load', () => {
  console.log('Page loaded');
  // Set default route if empty
  if (!window.location.hash) {
    console.log('No hash, setting default to #/login');
    window.location.hash = '#/login';
  }
  app.renderPage();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
  console.log('Browser back/forward');
  app.renderPage();
});

console.log('App initialization complete');

export default app;