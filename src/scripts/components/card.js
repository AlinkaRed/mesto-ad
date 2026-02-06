// src/scripts/components/card.js

// Берём шаблон карточки из HTML
const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

// Создаём карточку на основе данных с сервера
export const createCard = (cardData, handlers, userId) => {
  const {
    handleLikeClick,
    handleDeleteClick,
    handleImageClick,
    handleInfoClick
  } = handlers;

  const cardElement = getTemplate();

  // Находим все элементы внутри карточки
  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  // Подставляем данные из сервера
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = cardData.likes.length;

  // Если карточка не моя — убираем кнопку удаления
  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  }

  // Если я уже лайкал эту карточку — делаем кнопку активной
  if (cardData.likes.some(like => like._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  // Настраиваем, что будет происходить при кликах
  if (handleLikeClick) {
    likeButton.addEventListener('click', () => {
      handleLikeClick(cardData._id, likeButton, likeCount);
    });
  }

  // Удалять можно только свои карточки
  if (handleDeleteClick && cardData.owner._id === userId) {
    deleteButton.addEventListener('click', () => {
      handleDeleteClick(cardData._id, cardElement);
    });
  }

  // При клике на картинку — открываем её в большом размере
  if (handleImageClick) {
    cardImage.addEventListener('click', () => {
      handleImageClick({ name: cardData.name, link: cardData.link });
    });
  }

  // При клике на "i" — показываем информацию о карточке
  if (handleInfoClick && infoButton) {
    infoButton.addEventListener('click', (evt) => {
      evt.stopPropagation(); // чтобы не сработал клик по картинке одновременно
      handleInfoClick(cardData._id);
    });
  }

  return cardElement;
};
