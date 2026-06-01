(function() {
  function attemptLogin() {
    // Only run if there is a password field on the page
    const passwordField = document.querySelector('input[type="password"]');
    if (!passwordField) {
      return false;
    }

    // Try to find the username field
    let usernameField = document.querySelector('input[name="Username"], input[id="Username"], input[name="loginName"], input[id="loginName"], input[id="email"], input[type="email"], input[id*="Username" i], input[name*="Username" i]');
    
    if (!usernameField) {
      // If not found by common IDs, try finding the first text/email input before the password field
      const allInputs = Array.from(document.querySelectorAll('input'));
      const passwordIndex = allInputs.indexOf(passwordField);
      for (let i = passwordIndex - 1; i >= 0; i--) {
        if (allInputs[i].type === 'text' || allInputs[i].type === 'email' || allInputs[i].type === '') {
          usernameField = allInputs[i];
          break;
        }
      }
    }

    if (!usernameField || !passwordField) {
      return false;
    }

    // Helper to safely set value for React/Svelte/Vue inputs
    const setNativeValue = (element, value) => {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      
      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        element.value = value;
      }
      
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    };

    chrome.storage.local.get(['username', 'password', 'autoSubmit'], (result) => {
      if (result.username && result.password) {
        setTimeout(() => {
          setNativeValue(usernameField, result.username);
          setNativeValue(passwordField, result.password);

          if (result.autoSubmit !== false) {
            setTimeout(() => {
              // Try simulating enter key
              const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
              });
              passwordField.dispatchEvent(enterEvent);

              // Try clicking the button as fallback
              const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
              const submitButton = buttons.find(b => {
                const text = (b.innerText || b.value || '').toLowerCase();
                return b.type === 'submit' || text.includes('aanmelden') || text.includes('log in') || text.includes('login') || text.includes('sign in');
              });
              
              if (submitButton) {
                submitButton.click();
              } else if (typeof window.nativeLoginButtonClicked === 'function') {
                window.nativeLoginButtonClicked();
              }
            }, 300);
          }
        }, 500);
      }
    });
    return true;
  }

  // Run on load, or wait if elements aren't there yet
  if (!attemptLogin()) {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector('input[type="password"]')) {
        attemptLogin();
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
