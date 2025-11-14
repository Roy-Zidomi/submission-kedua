import ApiService from '../../data/api.js';
import { 
  setUser, 
  validateEmail, 
  validatePassword,
  showLoading,
  hideLoading,
  showAlert 
} from '../../utils/index.js';

class LoginPage {
  async render() {
    return `
      <div class="auth-container">
        <h2 class="auth-title">Login to Story App</h2>
        <form id="loginForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="yourname@example.com"
              required
              aria-required="true"
              aria-describedby="email-error"
            >
            <span id="email-error" class="error-message" role="alert"></span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="Minimum 8 characters"
              required
              aria-required="true"
              aria-describedby="password-error"
            >
            <span id="password-error" class="error-message" role="alert"></span>
          </div>

          <button type="submit" class="btn">Login</button>
        </form>

        <div class="auth-link">
          Don't have an account? <a href="#/register">Register here</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Real-time validation
    emailInput.addEventListener('blur', () => this._validateEmailField(emailInput));
    passwordInput.addEventListener('blur', () => this._validatePasswordField(passwordInput));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._handleLogin();
    });
  }

  _validateEmailField(input) {
    const errorSpan = document.getElementById('email-error');
    if (!input.value) {
      input.classList.add('error');
      errorSpan.textContent = 'Email is required';
      return false;
    }
    if (!validateEmail(input.value)) {
      input.classList.add('error');
      errorSpan.textContent = 'Please enter a valid email';
      return false;
    }
    input.classList.remove('error');
    errorSpan.textContent = '';
    return true;
  }

  _validatePasswordField(input) {
    const errorSpan = document.getElementById('password-error');
    if (!input.value) {
      input.classList.add('error');
      errorSpan.textContent = 'Password is required';
      return false;
    }
    if (!validatePassword(input.value)) {
      input.classList.add('error');
      errorSpan.textContent = 'Password must be at least 8 characters';
      return false;
    }
    input.classList.remove('error');
    errorSpan.textContent = '';
    return true;
  }

  async _handleLogin() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const isEmailValid = this._validateEmailField(emailInput);
    const isPasswordValid = this._validatePasswordField(passwordInput);

    if (!isEmailValid || !isPasswordValid) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      showLoading();
      const response = await ApiService.login(email, password);

      console.log('[LoginPage] Response dari API:', response);

      const token = response?.loginResult?.token;
      if (!token) {
        console.error('[LoginPage] Token tidak ditemukan di response:', response);
        hideLoading();
        showAlert('Login gagal: server tidak mengembalikan token.', 'error');
        return;
      }

      // ✅ Simpan token secara langsung ke localStorage
      localStorage.setItem('token', token);
      console.log('[LoginPage] Token disimpan ke localStorage:', token);

      // Simpan user info
      setUser({
        userId: response?.loginResult?.userId,
        name: response?.loginResult?.name,
      });

      hideLoading();
      showAlert('✅ Login successful!', 'success');

      // Redirect ke halaman utama
      window.location.hash = '#/home';
    } catch (error) {
      hideLoading();
      console.error('[LoginPage] Error saat login:', error);
      showAlert(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      hideLoading();
    }
  }
}

export default LoginPage;
