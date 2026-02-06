// src/scripts/index.js

// Подключаем функции для работы с сервером
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setAvatarInfo,
  addCard,
  deleteCard as apiDeleteCard,
  changeLikeCardStatus
} from './components/api.js';

// Подключаем создание карточек и модальные окна
import { createCard } from './components/card.js';
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners
} from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';

// Форматируем дату создания карточки красиво на русском
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Создаём строку с информацией (например: "Владелец: Иван")
const createInfoItem = (term, description) => {
  const template = document.querySelector('#popup-info-definition-template');
  const item = template.content.cloneNode(true);
  item.querySelector('.popup__info-term').textContent = term;
  item.querySelector('.popup__info-description').textContent = description;
  return item;
};

// Берём все нужные элементы со страницы
const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileImage = document.querySelector('.profile__image');

const editButton = document.querySelector('.profile__edit-button');
const addButton = document.querySelector('.profile__add-button');
const cardsList = document.querySelector('.places__list');

// Находим все попапы
const editPopup = document.querySelector('.popup_type_edit');
const addPopup = document.querySelector('.popup_type_new-card');
const imagePopup = document.querySelector('.popup_type_image');
const avatarPopup = document.querySelector('.popup_type_edit-avatar');
const infoPopup = document.querySelector('.popup_type_info');

// Поля форм
const editForm = editPopup.querySelector('.popup__form');
const nameInput = editForm.querySelector('.popup__input_type_name');
const jobInput = editForm.querySelector('.popup__input_type_description');

const addForm = addPopup.querySelector('.popup__form');
const cardNameInput = addForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = addForm.querySelector('.popup__input_type_url');

const avatarForm = avatarPopup.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input_type_avatar');

// Элементы для просмотра изображения
const popupImage = imagePopup.querySelector('.popup__image');
const popupCaption = imagePopup.querySelector('.popup__caption');

// Списки в попапе информации
const infoList = infoPopup.querySelector('.popup__info');
const likesList = infoPopup.querySelector('.popup__list');

// Кнопки отправки форм
const editSubmitButton = editForm.querySelector('.popup__button');
const addSubmitButton = addForm.querySelector('.popup__button');
const avatarSubmitButton = avatarForm.querySelector('.popup__button');

// Сохраняем ID текущего пользователя, чтобы знать, чьи карточки можно удалять
let currentUserId;

// Открываем большое изображение при клике на карточку
const openImagePopup = ({ name, link }) => {
  popupImage.src = link;
  popupImage.alt = name;
  popupCaption.textContent = name;
  openModalWindow(imagePopup);
};

// Сохраняем новые данные профиля
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
      console.error(err);
    })
    .finally(() => {
      editSubmitButton.textContent = 'Сохранить';
      editSubmitButton.disabled = false;
    });
};

// Добавляем новую карточку
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
      console.error(err);
    })
    .finally(() => {
      addSubmitButton.textContent = 'Создать';
      addSubmitButton.disabled = false;
    });
};

// Меняем аватар
const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarSubmitButton.textContent = 'Сохранение...';
  avatarSubmitButton.disabled = true;

  setAvatarInfo({ avatar: avatarInput.value })
    .then((userData) => {
      profileImage.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarPopup);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = 'Сохранить';
      avatarSubmitButton.disabled = false;
    });
};

// Обрабатываем лайк
const handleLikeClick = (cardId, likeButton, likeCountElement) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active', !isLiked);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.error(err);
    });
};

// Удаляем карточку
const handleDeleteClick = (cardId, cardElement) => {
  if (!confirm('Вы уверены, что хотите удалить эту карточку?')) return;

  apiDeleteCard(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error(err);
    });
};

// Показываем информацию о карточке по клику на "i"
const handleInfoClick = (cardId) => {
  infoList.innerHTML = '';
  likesList.innerHTML = '';

  getCardList()
    .then(cards => {
      const cardData = cards.find(card => card._id === cardId);
      if (!cardData) {
        throw new Error('Карточка не найдена');
      }

      infoList.append(
        createInfoItem('Описание:', cardData.name),
        createInfoItem('Дата создания:', formatDate(cardData.createdAt)),
        createInfoItem('Владелец:', cardData.owner.name),
        createInfoItem('Количество лайков:', String(cardData.likes.length))
      );

      if (cardData.likes.length > 0) {
        cardData.likes.forEach(likeUser => {
          const userTemplate = document.querySelector('#popup-info-user-preview-template');
          const userItem = userTemplate.content.cloneNode(true);
          userItem.querySelector('.popup__list-item').textContent = likeUser.name;
          likesList.append(userItem);
        });
      } else {
        const emptyItem = document.createElement('li');
        emptyItem.classList.add('popup__list-item');
        emptyItem.textContent = 'Никто ещё не лайкнул эту карточку';
        likesList.append(emptyItem);
      }

      openModalWindow(infoPopup);
    })
    .catch(err => {
      console.error('Ошибка при загрузке информации о карточке:', err);
      alert('Не удалось загрузить информацию о карточке');
    });
};

// Открываем попапы при клике на кнопки
editButton.addEventListener('click', () => {
  nameInput.value = profileTitle.textContent;
  jobInput.value = profileDescription.textContent;
  clearValidation(editForm, validationConfig);
  openModalWindow(editPopup);
});

addButton.addEventListener('click', () => {
  addForm.reset();
  clearValidation(addForm, validationConfig);
  openModalWindow(addPopup);
});

profileImage.addEventListener('click', () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarPopup);
});

// Включаем валидацию форм
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

enableValidation(validationConfig);

// Закрываем все попапы по крестику, клику вне или Escape
document.querySelectorAll('.popup').forEach(popup => {
  setCloseModalWindowEventListeners(popup);
});

// Загружаем данные с сервера при старте
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileImage.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach(cardData => {
      const cardElement = createCard(
        cardData,
        {
          handleLikeClick,
          handleDeleteClick,
          handleImageClick: openImagePopup,
          handleInfoClick
        },
        currentUserId
      );
      cardsList.append(cardElement);
    });
  })
  .catch(err => {
    console.error('Ошибка загрузки данных:', err);
  });

// Навешиваем обработчики на отправку форм
editForm.addEventListener('submit', handleEditFormSubmit);
addForm.addEventListener('submit', handleAddFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);
