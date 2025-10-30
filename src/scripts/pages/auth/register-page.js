import ApiService from '../../data/api.js';
import { 
  validateEmail, 
  validatePassword,
  showLoading,
  hideLoading,
  showAlert 
} from '../../utils/index.js';

class RegisterPage {
  async render() {
    return `
      <div class="auth-container">
        <h2 class="auth-title">Create Account</h2>
        <form id="registerForm" class="auth-form" novalidate>
          <div class="form-group">
            <label for="name" class="form-label">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-input" 
              placeholder="Your full name"
              required
              aria-required="true"
              aria-describedby="name-error"
            >
            <span id="name-error" class="error-message" role="alert"></span>
          </div>

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

          <button type="submit" class="btn">Register</button>
        </form>

        <div class="auth-link">
          Already have an account? <a href="#/login">Login here</a>
        </div>
      </div>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    nameInput.addEventListener('blur', () => this._validateNameField(nameInput));
    emailInput.addEventListener('blur', () => this._validateEmailField(emailInput));
    passwordInput.addEventListener('blur', () => this._validatePasswordField(passwordInput));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this._handleRegister();
    });
  }

  _validateNameField(input) {
    const errorSpan = document.getElementById('name-error');
    if (!input.value || input.value.trim().length < 3) {
      input.classList.add('error');
      errorSpan.textContent = 'Name must be at least 3 characters';
      return false;
    }
    input.classList.remove('error');
    errorSpan.textContent = '';
    return true;
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

  async _handleRegister() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const isNameValid = this._validateNameField(nameInput);
    const isEmailValid = this._validateEmailField(emailInput);
    const isPasswordValid = this._validatePasswordField(passwordInput);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      showLoading();
      await ApiService.register(name, email, password);

      showAlert('Registration successful! Please login.', 'success');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 1500);
    } catch (error) {
      hideLoading();
      showAlert(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      hideLoading();
    }
  }
}

export default RegisterPage;