function showInputError(formElement, inputElement, message, validationConfig) {
  const errorSpan = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorSpan) return;
  errorSpan.textContent = message;
  errorSpan.classList.add(validationConfig.errorClass);
  inputElement.classList.add(validationConfig.inputErrorClass);
}

function hideInputError(formElement, inputElement, validationConfig) {
  const errorSpan = formElement.querySelector(`#${inputElement.id}-error`);
  if (!errorSpan) return;
  errorSpan.textContent = '';
  errorSpan.classList.remove(validationConfig.errorClass);
  inputElement.classList.remove(validationConfig.inputErrorClass);
}

function getInputErrorMessage(inputElement) {
  if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage || '');
  } else {
    inputElement.setCustomValidity('');
  }

  if (!inputElement.validity.valid) {
    return inputElement.validationMessage;
  }
  return '';
}

function checkInputValidity(formElement, inputElement, validationConfig) {
  const message = getInputErrorMessage(inputElement);
  if (message) {
    showInputError(formElement, inputElement, message, validationConfig);
  } else {
    hideInputError(formElement, inputElement, validationConfig);
  }
}

function hasInvalidInput(formElement, validationConfig) {
  const inputElements = Array.from(formElement.querySelectorAll(validationConfig.inputSelector));
  return inputElements.some((inputElement) => getInputErrorMessage(inputElement) !== '');
}

function disableSubmitButton(formElement, validationConfig) {
  const submitButton = formElement.querySelector(validationConfig.submitButtonSelector);
  if (!submitButton) return;
  submitButton.disabled = true;
  submitButton.classList.add(validationConfig.inactiveButtonClass);
}

function enableSubmitButton(formElement, validationConfig) {
  const submitButton = formElement.querySelector(validationConfig.submitButtonSelector);
  if (!submitButton) return;
  submitButton.disabled = false;
  submitButton.classList.remove(validationConfig.inactiveButtonClass);
}

function toggleButtonState(formElement, validationConfig) {
  if (hasInvalidInput(formElement, validationConfig)) {
    disableSubmitButton(formElement, validationConfig);
  } else {
    enableSubmitButton(formElement, validationConfig);
  }
}

function setEventListeners(formElement, validationConfig) {
  const inputElements = formElement.querySelectorAll(validationConfig.inputSelector);
  inputElements.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, validationConfig);
      toggleButtonState(formElement, validationConfig);
    });
  });
}

function clearValidation(formElement, validationConfig) {
  const inputElements = formElement.querySelectorAll(validationConfig.inputSelector);
  inputElements.forEach((inputElement) => {
    inputElement.setCustomValidity('');
    hideInputError(formElement, inputElement, validationConfig);
  });
  disableSubmitButton(formElement, validationConfig);
}

function enableValidation(validationConfig) {
  const formElements = document.querySelectorAll(validationConfig.formSelector);
  formElements.forEach((formElement) => {
    setEventListeners(formElement, validationConfig);
    toggleButtonState(formElement, validationConfig);
  });
}

export {
  clearValidation,
  enableValidation
};