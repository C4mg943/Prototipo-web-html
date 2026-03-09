const toggleBtn = document.getElementById('toggle-pwd');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eye-icon');

// Muestra/oculta la contraseña
toggleBtn.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  eyeIcon.className = isHidden ? 'ph ph-eye-slash' : 'ph ph-eye';
});

// Redirige al menú al enviar
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  window.location.href = 'html/menu.html';
});
