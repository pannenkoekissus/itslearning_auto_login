document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const autoSubmitCheckbox = document.getElementById('autoSubmit');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['username', 'password', 'autoSubmit'], (result) => {
    if (result.username) usernameInput.value = result.username;
    if (result.password) passwordInput.value = result.password;
    if (result.autoSubmit !== undefined) autoSubmitCheckbox.checked = result.autoSubmit;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const autoSubmit = autoSubmitCheckbox.checked;

    if (!username || !password) {
      showStatus('Please enter both username and password.', 'error');
      return;
    }

    chrome.storage.local.set({ username, password, autoSubmit }, () => {
      showStatus('Credentials saved successfully!', 'success');
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }
});
