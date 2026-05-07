// src/scripts/index.js

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  updateUserAvatar,
  addCard,
  deleteCard as apiDeleteCard,
  changeLikeCardStatus
} from './components/api.js';

import { createCard, toggleLike, deleteCard, isCardLiked } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

// --- DOM Elements ---
const profileTitleElement = document.querySelector('.profile__title');
const profileDescriptionElement = document.querySelector('.profile__description');
const profileImageElement = document.querySelector('.profile__image');

const editProfileButton = document.querySelector('.profile__edit-button');
const addCardButton = document.querySelector('.profile__add-button');
const cardsListElement = document.querySelector('.places__list');

const editProfilePopup = document.querySelector('.popup_type_edit');
const addCardPopup = document.querySelector('.popup_type_new-card');
const imagePreviewPopup = document.querySelector('.popup_type_image');
const editAvatarPopup = document.querySelector('.popup_type_edit-avatar');
const cardInfoPopup = document.querySelector('.popup_type_card-details');
const confirmRemovePopup = document.querySelector('.popup_type_remove-card');

const editProfileForm = editProfilePopup.querySelector('.popup__form');
const profileNameInput = editProfileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = editProfileForm.querySelector('.popup__input_type_description');

const addCardForm = addCardPopup.querySelector('.popup__form');
const cardNameInput = addCardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = addCardForm.querySelector('.popup__input_type_url');

const editAvatarForm = editAvatarPopup.querySelector('.popup__form');
const avatarInput = editAvatarForm.querySelector('.popup__input_type_avatar');

const previewImageElement = imagePreviewPopup.querySelector('.popup__image');
const previewCaptionElement = imagePreviewPopup.querySelector('.popup__caption');

const cardInfoRowsList = cardInfoPopup.querySelector('.js-card-info-rows');
const cardInfoLikersList = cardInfoPopup.querySelector('.js-card-info-likers');

const confirmRemoveForm = confirmRemovePopup.querySelector('#remove-card-form');
const confirmRemoveSubmitButton = confirmRemoveForm.querySelector('.popup__button');

const editProfileSubmitButton = editProfileForm.querySelector('.popup__button');
const addCardSubmitButton = addCardForm.querySelector('.popup__button');
const editAvatarSubmitButton = editAvatarForm.querySelector('.popup__button');

// --- Global Variables & Settings ---
let currentUserId;
let pendingCardToDelete = null;

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// --- Functions ---
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createCardInfoItem(labelText, valueText) {
  const template = document.querySelector('#popup-info-definition-template');
  const item = template.content.cloneNode(true);
  item.querySelector('.popup__info-term').textContent = labelText;
  item.querySelector('.popup__info-description').textContent = valueText;
  return item;
}

function openCardImagePopup({ name, link }) {
  previewImageElement.src = link;
  previewImageElement.alt = name;
  previewCaptionElement.textContent = name;
  openModalWindow(imagePreviewPopup);
}

function handleProfileFormSubmit(event) {
  event.preventDefault();
  editProfileSubmitButton.textContent = 'Сохранение...';
  editProfileSubmitButton.disabled = true;

  setUserInfo({
    name: profileNameInput.value,
    about: profileDescriptionInput.value
  })
    .then((userData) => {
      profileTitleElement.textContent = userData.name;
      profileDescriptionElement.textContent = userData.about;
      closeModalWindow(editProfilePopup);
    })
    .catch(console.error)
    .finally(() => {
      editProfileSubmitButton.textContent = 'Сохранить';
    });
}

function handleNewCardFormSubmit(event) {
  event.preventDefault();
  addCardSubmitButton.textContent = 'Создание...';
  addCardSubmitButton.disabled = true;

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((newCardData) => {
      const cardElement = createCard(
        newCardData,
        cardEventHandlers,
        currentUserId
      );
      cardsListElement.prepend(cardElement);
      closeModalWindow(addCardPopup);
      addCardForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      addCardSubmitButton.textContent = 'Создать';
    });
}

function handleAvatarUpdateFormSubmit(event) {
  event.preventDefault();
  editAvatarSubmitButton.textContent = 'Сохранение...';
  editAvatarSubmitButton.disabled = true;

  updateUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileImageElement.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(editAvatarPopup);
      editAvatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      editAvatarSubmitButton.textContent = 'Сохранить';
    });
}

function handleCardLikeButtonClick(cardId, likeButtonElement, likeCountElement) {
  const isLiked = isCardLiked(likeButtonElement);
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      toggleLike(likeButtonElement, likeCountElement, updatedCard.likes.length);
    })
    .catch(console.error);
}

function handleCardDeleteButtonClick(cardId, cardElement) {
  pendingCardToDelete = { cardId, cardElement };
  openModalWindow(confirmRemovePopup);
}

function handleConfirmRemoveFormSubmit(event) {
  event.preventDefault();
  if (!pendingCardToDelete) {
    return;
  }

  const { cardId, cardElement } = pendingCardToDelete;
  confirmRemoveSubmitButton.textContent = 'Удаление...';
  confirmRemoveSubmitButton.disabled = true;

  apiDeleteCard(cardId)
    .then(() => {
      deleteCard(cardElement);
      closeModalWindow(confirmRemovePopup);
      pendingCardToDelete = null;
    })
    .catch(console.error)
    .finally(() => {
      confirmRemoveSubmitButton.textContent = 'Да';
      confirmRemoveSubmitButton.disabled = false;
    });
}

function handleCardInfoButtonClick(cardId) {
  cardInfoRowsList.replaceChildren();
  cardInfoLikersList.replaceChildren();

  getCardList()
    .then((cards) => {
      const selectedCardData = cards.find((cardItem) => cardItem._id === cardId);
      if (!selectedCardData) {
        throw new Error('Карточка не найдена');
      }

      cardInfoRowsList.append(
        createCardInfoItem('Описание:', selectedCardData.name),
        createCardInfoItem('Дата создания:', formatDate(selectedCardData.createdAt)),
        createCardInfoItem('Владелец:', selectedCardData.owner.name),
        createCardInfoItem('Количество лайков:', String(selectedCardData.likes.length))
      );

      if (selectedCardData.likes.length > 0) {
        selectedCardData.likes.forEach((likedUser) => {
          const likerTemplate = document.querySelector(
            '#popup-info-user-preview-template'
          );
          const likerItem = likerTemplate.content.cloneNode(true);
          likerItem.querySelector('.popup__list-item').textContent =
            likedUser.name;
          cardInfoLikersList.append(likerItem);
        });
      } else {
        const emptyLikerItem = document.createElement('li');
        emptyLikerItem.classList.add('popup__list-item');
        emptyLikerItem.textContent = 'Никто ещё не лайкнул эту карточку';
        cardInfoLikersList.append(emptyLikerItem);
      }

      openModalWindow(cardInfoPopup);
    })
    .catch(console.error);
}

const cardEventHandlers = {
  onLikeButtonClick: handleCardLikeButtonClick,
  onDeleteButtonClick: handleCardDeleteButtonClick,
  onImageClick: openCardImagePopup,
  onInfoButtonClick: handleCardInfoButtonClick
};

// --- Initialization & Event Listeners ---

enableValidation(validationConfig);

editProfileButton.addEventListener('click', () => {
  profileNameInput.value = profileTitleElement.textContent;
  profileDescriptionInput.value = profileDescriptionElement.textContent;
  clearValidation(editProfileForm, validationConfig);
  openModalWindow(editProfilePopup);
});

addCardButton.addEventListener('click', () => {
  addCardForm.reset();
  clearValidation(addCardForm, validationConfig);
  openModalWindow(addCardPopup);
});

profileImageElement.addEventListener('click', () => {
  editAvatarForm.reset();
  clearValidation(editAvatarForm, validationConfig);
  openModalWindow(editAvatarPopup);
});

document.querySelectorAll('.popup').forEach((popupElement) => {
  setCloseModalWindowEventListeners(popupElement);
});

confirmRemovePopup.addEventListener('popupclosed', () => {
  pendingCardToDelete = null;
});

editProfileForm.addEventListener('submit', handleProfileFormSubmit);
addCardForm.addEventListener('submit', handleNewCardFormSubmit);
editAvatarForm.addEventListener('submit', handleAvatarUpdateFormSubmit);
confirmRemoveForm.addEventListener('submit', handleConfirmRemoveFormSubmit);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitleElement.textContent = userData.name;
    profileDescriptionElement.textContent = userData.about;
    profileImageElement.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      cardsListElement.append(createCard(cardData, cardEventHandlers, currentUserId));
    });
  })
  .catch(console.error);