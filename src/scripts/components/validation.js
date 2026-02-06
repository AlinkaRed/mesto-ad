function showInputError(form, input, message, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  errorSpan.textContent = message;
  errorSpan.classList.add(config.errorClass);
  input.classList.add(config.inputErrorClass);
}

function hideInputError(form, input, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  errorSpan.textContent = '';
  errorSpan.classList.remove(config.errorClass);
  input.classList.remove(config.inputErrorClass);
}

function checkInputValidity(form, input, config) {
  if (!input.value.trim()) {
    showInputError(form, input, 'Заполните это поле', config);
    return;
  }

  const nameField = input.classList.contains('popup__input_type_name');
  const cardNameField = input.classList.contains('popup__input_type_card-name');
  const descField = input.classList.contains('popup__input_type_description');
  const urlField = input.classList.contains('popup__input_type_url');

  const minLen = 2;
  const maxLen = nameField ? 40 : cardNameField ? 30 : descField ? 200 : Infinity;

  if (input.value.length < minLen || input.value.length > maxLen) {
    const lenMsg = nameField || cardNameField ? 'От 2 до 30 символов' : 'От 2 до 200 символов';
    showInputError(form, input, lenMsg, config);
    return;
  }

  if (nameField || cardNameField) {
    const lettersOnly = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!lettersOnly.test(input.value)) {
      const errMsg = input.dataset.errorMessage || 'Только буквы, пробелы и дефисы';
      showInputError(form, input, errMsg, config);
      return;
    }
  }

  if (urlField) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.[a-z]{2,6}[\/\w .-]*\.(jpg|jpeg|png|gif|svg|webp)$/i;
    if (!urlPattern.test(input.value)) {
      showInputError(form, input, 'Нужна ссылка на картинку', config);
      return;
    }
  }

  hideInputError(form, input, config);
}

function hasInvalidInput(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  return inputs.some(input => !input.validity.valid);
}

function disableSubmitButton(form, config) {
  const btn = form.querySelector(config.submitButtonSelector);
  btn.disabled = true;
  btn.classList.add(config.inactiveButtonClass);
}

function enableSubmitButton(form, config) {
  const btn = form.querySelector(config.submitButtonSelector);
  btn.disabled = false;
  btn.classList.remove(config.inactiveButtonClass);
}

function toggleButtonState(form, config) {
  if (hasInvalidInput(form, config)) {
    disableSubmitButton(form, config);
  } else {
    enableSubmitButton(form, config);
  }
}

function setEventListeners(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      checkInputValidity(form, input, config);
      toggleButtonState(form, config);
    });
  });
}

function clearValidation(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  inputs.forEach(input => hideInputError(form, input, config));
  disableSubmitButton(form, config);
}

function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  forms.forEach(form => {
    const inputs = form.querySelectorAll(config.inputSelector);
    inputs.forEach(input => input.removeEventListener('input', () => {}));
    
    setEventListeners(form, config);
    toggleButtonState(form, config);
  });
}

export { enableValidation, clearValidation };
