// src/scripts/index.js

import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setAvatarInfo,
  addCard,
  deleteCard as apiDeleteCard,
  changeLikeCardStatus
} from './components/api.js';

import { createCard } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const createInfoItem = (term, description) => {
  const template = document.querySelector('#popup-info-definition-template');
  const item = template.content.cloneNode(true);
  item.querySelector('.popup__info-term').textContent = term;
  item.querySelector('.popup__info-description').textContent = description;
  return item;
};

const truncateCardTitle = (name, maxLen = 16) => {
  if (name.length <= maxLen) {
    return name;
  }
  return `${name.slice(0, maxLen - 1)}…`;
};

const computeCardStatistics = (cards) => {
  const uniqueOwners = new Set(cards.map((card) => card.owner._id));
  const totalUsers = uniqueOwners.size;

  const totalLikes = cards.reduce((sum, card) => sum + card.likes.length, 0);

  const likesGivenByUser = {};
  cards.forEach((card) => {
    card.likes.forEach((user) => {
      likesGivenByUser[user._id] = (likesGivenByUser[user._id] || 0) + 1;
    });
  });

  let maxLikesFromOne = 0;
  let championName = '—';
  Object.entries(likesGivenByUser).forEach(([userId, count]) => {
    if (count > maxLikesFromOne) {
      maxLikesFromOne = count;
      const userSample = cards
        .flatMap((c) => c.likes)
        .find((u) => u._id === userId);
      championName = userSample ? userSample.name : '—';
    }
  });

  const popularCards = [...cards]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 3)
    .map((c) => c.name);

  return {
    totalUsers,
    totalLikes,
    maxLikesFromOne,
    championName,
    popularCards
  };
};

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

const headerLogo = document.querySelector('.header__logo');
const editButton = document.querySelector('.profile__edit-button');
const addButton = document.querySelector('.profile__add-button');
const cardsList = document.querySelector('.places__list');

const editPopup = document.querySelector('.popup_type_edit');
const addPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const avatarPopup = document.querySelector('.popup_type_edit-avatar');
const statsPopup = document.querySelector('.popup_type_info');
const cardDetailsPopup = document.querySelector('.popup_type_card-details');
const removePopup = document.querySelector('.popup_type_remove-card');

const editForm = editPopup.querySelector('.popup__form');
const nameInput = editForm.querySelector('.popup__input_type_name');
const jobInput = editForm.querySelector('.popup__input_type_description');

const addForm = addPopup.querySelector('.popup__form');
const cardNameInput = addForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = addForm.querySelector('.popup__input_type_url');

const avatarForm = avatarPopup.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

const popupImage = imagePopup.querySelector('.popup__image');
const popupCaption = imagePopup.querySelector('.popup__caption');

const statsRows = statsPopup.querySelector('.js-stats-rows');
const statsPopular = statsPopup.querySelector('.js-stats-popular');

const cardDetailsRows = cardDetailsPopup.querySelector('.js-card-details-rows');
const cardDetailsLikers = cardDetailsPopup.querySelector('.js-card-details-likers');

const removeForm = removePopup.querySelector('#remove-card-form');
const removeSubmitButton = removeForm.querySelector('.popup__button');

const editSubmitButton = editForm.querySelector('.popup__button');
const addSubmitButton = addForm.querySelector('.popup__button');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');

let currentUserId;
let pendingDelete = null;

const validationSettings = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible',
  namePatternFieldSelector:
    '.popup__input_type_name, .popup__input_type_card-name',
  urlFieldSelector: '.popup__input_type_url, .popup__input_type_avatar',
  submitButtonExtraDisabled: (form) => {
    const nameField = form.querySelector('.popup__input_type_name');
    const descField = form.querySelector('.popup__input_type_description');
    if (!nameField || !descField) return false;
    return (
      nameField.value === profileTitle.textContent &&
      descField.value === profileDescription.textContent
    );
  }
};

enableValidation(validationSettings);

const openImagePopup = ({ name, link }) => {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModalWindow(imagePopup);
};

const handleEditFormSubmit = (evt) => {
  evt.preventDefault();
  editSubmitButton.textContent = 'Сохранение...';
  editSubmitButton.disabled = true;

  setUserInfo({
    name: nameInput.value,
    about: jobInput.value
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(editPopup);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      editSubmitButton.textContent = 'Сохранить';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      jobInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const handleAddFormSubmit = (evt) => {
  evt.preventDefault();
  addSubmitButton.textContent = 'Создание...';
  addSubmitButton.disabled = true;

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((newCardData) => {
      const cardElement = createCard(
        newCardData,
        {
          handleLikeClick,
          handleDeleteClick,
          handleImageClick: openImagePopup,
          handleInfoClick
        },
        currentUserId
      );
      cardsList.prepend(cardElement);
      closeModalWindow(addPopup);
      addForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      addSubmitButton.textContent = 'Создать';
      cardNameInput.dispatchEvent(new Event('input', { bubbles: true }));
      cardLinkInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarSubmitButton.textContent = 'Сохранение...';
  avatarSubmitButton.disabled = true;

  setAvatarInfo({ avatar: avatarInput.value })
    .then((userData) => {
      profileImage.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarPopup);
      avatarForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = 'Сохранить';
      avatarInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
};

const handleLikeClick = (cardId, likeButton, likeCountElement) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active', !isLiked);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteClick = (cardId, cardElement) => {
  pendingDelete = { cardId, cardElement };
  openModalWindow(removePopup);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  if (!pendingDelete) {
    return;
  }

  const { cardId, cardElement } = pendingDelete;
  removeSubmitButton.textContent = 'Удаление...';
  removeSubmitButton.disabled = true;

  apiDeleteCard(cardId)
    .then(() => {
      cardElement.remove();
      closeModalWindow(removePopup);
      pendingDelete = null;
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      removeSubmitButton.textContent = 'Да';
      removeSubmitButton.disabled = false;
    });
};

const handleInfoClick = (cardId) => {
  cardDetailsRows.replaceChildren();
  cardDetailsLikers.replaceChildren();

  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        throw new Error('Карточка не найдена');
      }

      cardDetailsRows.append(
        createInfoItem('Описание:', cardData.name),
        createInfoItem('Дата создания:', formatDate(cardData.createdAt)),
        createInfoItem('Владелец:', cardData.owner.name),
        createInfoItem('Количество лайков:', String(cardData.likes.length))
      );

      if (cardData.likes.length > 0) {
        cardData.likes.forEach((likeUser) => {
          const userTemplate = document.querySelector(
            '#popup-info-user-preview-template'
          );
          const userItem = userTemplate.content.cloneNode(true);
          userItem.querySelector('.popup__list-item').textContent =
            likeUser.name;
          cardDetailsLikers.append(userItem);
        });
      } else {
        const emptyItem = document.createElement('li');
        emptyItem.classList.add('popup__list-item');
        emptyItem.textContent = 'Никто ещё не лайкнул эту карточку';
        cardDetailsLikers.append(emptyItem);
      }

      openModalWindow(cardDetailsPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const stats = computeCardStatistics(cards);
      statsRows.replaceChildren();
      statsRows.append(
        createInfoItem('Всего пользователей:', String(stats.totalUsers)),
        createInfoItem('Всего лайков:', String(stats.totalLikes)),
        createInfoItem(
          'Максимально лайков от одного:',
          String(stats.maxLikesFromOne)
        ),
        createInfoItem('Чемпион лайков:', stats.championName)
      );

      statsPopular.replaceChildren();
      const previewTemplate = document.querySelector(
        '#popup-info-user-preview-template'
      );
      stats.popularCards.forEach((title) => {
        const node = previewTemplate.content.cloneNode(true);
        const li = node.querySelector('.popup__list-item');
        li.classList.add('popup__list-item_type_badge');
        li.textContent = truncateCardTitle(title);
        statsPopular.append(node);
      });

      openModalWindow(statsPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

editButton.addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  clearValidation(editForm, validationSettings);
  openModalWindow(editPopup);
});

addButton.addEventListener('click', () => {
  addForm.reset();
  clearValidation(addForm, validationSettings);
  openModalWindow(addPopup);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarPopup);
});

headerLogo.addEventListener('click', handleLogoClick);

const cardHandlers = {
  handleLikeClick,
  handleDeleteClick,
  handleImageClick: openImagePopup,
  handleInfoClick
};

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileImage.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      cardsList.append(createCard(cardData, cardHandlers, currentUserId));
    });
  })
  .catch((err) => {
    console.log(err);
  });

document.querySelectorAll('.popup').forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

removePopup.addEventListener('popupclosed', () => {
  pendingDelete = null;
});

editForm.addEventListener('submit', handleEditFormSubmit);
addForm.addEventListener('submit', handleAddFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
removeForm.addEventListener('submit', handleRemoveCardSubmit);
