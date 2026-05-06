const handleEscapeKeyUp = (event) => {
  if (event.key === 'Escape') {
    const openedPopupElement = document.querySelector('.popup_is-opened');
    closeModalWindow(openedPopupElement);
  }
};

export const openModalWindow = (modalWindow) => {
  modalWindow.classList.add('popup_is-opened');
  document.addEventListener('keyup', handleEscapeKeyUp);
};

export const closeModalWindow = (modalWindow) => {
  if (!modalWindow) {
    return;
  }
  modalWindow.classList.remove('popup_is-opened');
  document.removeEventListener('keyup', handleEscapeKeyUp);
  modalWindow.dispatchEvent(new CustomEvent('popupclosed'));
};

export const setCloseModalWindowEventListeners = (modalWindow) => {
  const closeButtonElement = modalWindow.querySelector('.popup__close');
  closeButtonElement.addEventListener('click', () => {
    closeModalWindow(modalWindow);
  });

  modalWindow.addEventListener('mousedown', (event) => {
    if (event.target.classList.contains('popup')) {
      closeModalWindow(modalWindow);
    }
  });
};