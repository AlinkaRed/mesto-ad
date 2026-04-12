/** Допустимые символы для полей «Имя» и «Название» (латиница, кириллица, дефис, пробел) */
const NAME_LIKE_PATTERN = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;

function showInputError(form, input, message, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  if (!errorSpan) return;
  errorSpan.textContent = message;
  errorSpan.classList.add(config.errorClass);
  input.classList.add(config.inputErrorClass);
}

function hideInputError(form, input, config) {
  const errorSpan = form.querySelector(`#${input.id}-error`);
  if (!errorSpan) return;
  errorSpan.textContent = '';
  errorSpan.classList.remove(config.errorClass);
  input.classList.remove(config.inputErrorClass);
}

/**
 * Возвращает текст ошибки или пустую строку, если поле допустимо.
 * Селекторы специфики полей задаются только через config извне.
 */
function getInputErrorMessage(form, input, config) {
  const requiredEmpty =
    input.hasAttribute('required') && !input.value.trim();

  if (requiredEmpty) {
    return input.validationMessage || 'Заполните это поле';
  }

  const isNameLike =
    config.namePatternFieldSelector &&
    input.matches(config.namePatternFieldSelector);

  if (isNameLike) {
    if (!input.validity.valid) {
      return input.validationMessage || 'Заполните это поле';
    }
    if (!NAME_LIKE_PATTERN.test(input.value)) {
      return (
        input.dataset.errorMessage ||
        input.validationMessage ||
        'Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы'
      );
    }
    return '';
  }

  const isUrlField =
    config.urlFieldSelector && input.matches(config.urlFieldSelector);

  if (isUrlField) {
    if (!input.validity.valid) {
      return input.validationMessage;
    }
    return '';
  }

  // Остальные поля (например, описание): встроенные ограничения HTML5
  if (!input.validity.valid) {
    return input.validationMessage;
  }

  return '';
}

function checkInputValidity(form, input, config) {
  const message = getInputErrorMessage(form, input, config);
  if (message) {
    showInputError(form, input, message, config);
  } else {
    hideInputError(form, input, config);
  }
}

function hasInvalidInput(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  return inputs.some((input) => getInputErrorMessage(form, input, config) !== '');
}

function disableSubmitButton(form, config) {
  const btn = form.querySelector(config.submitButtonSelector);
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add(config.inactiveButtonClass);
}

function enableSubmitButton(form, config) {
  const btn = form.querySelector(config.submitButtonSelector);
  if (!btn) return;
  btn.disabled = false;
  btn.classList.remove(config.inactiveButtonClass);
}

function toggleButtonState(form, config) {
  const invalid = hasInvalidInput(form, config);
  const extraDisabled =
    typeof config.submitButtonExtraDisabled === 'function'
      ? config.submitButtonExtraDisabled(form)
      : false;

  if (invalid || extraDisabled) {
    disableSubmitButton(form, config);
  } else {
    enableSubmitButton(form, config);
  }
}

function setEventListeners(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      checkInputValidity(form, input, config);
      toggleButtonState(form, config);
    });
  });
}

function clearValidation(form, config) {
  const inputs = form.querySelectorAll(config.inputSelector);
  inputs.forEach((input) => hideInputError(form, input, config));
  disableSubmitButton(form, config);
}

function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  forms.forEach((form) => {
    setEventListeners(form, config);
    toggleButtonState(form, config);
  });
}

export {
  showInputError,
  hideInputError,
  checkInputValidity,
  hasInvalidInput,
  disableSubmitButton,
  enableSubmitButton,
  toggleButtonState,
  setEventListeners,
  clearValidation,
  enableValidation
};
