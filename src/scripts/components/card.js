// src/scripts/components/card.js

const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCard = (cardData, handlers, userId) => {
  const {
    handleLikeClick,
    handleDeleteClick,
    handleImageClick,
    handleInfoClick
  } = handlers;

  const cardElement = getTemplate();
  const likes = cardData.likes || [];

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCount = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCount.textContent = likes.length;

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  }

  if (likes.some((like) => like._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  if (handleLikeClick) {
    likeButton.addEventListener('click', () => {
      handleLikeClick(cardData._id, likeButton, likeCount);
    });
  }

  if (handleDeleteClick && cardData.owner._id === userId) {
    deleteButton.addEventListener('click', () => {
      handleDeleteClick(cardData._id, cardElement);
    });
  }

  if (handleImageClick) {
    cardImage.addEventListener('click', () => {
      handleImageClick({ name: cardData.name, link: cardData.link });
    });
  }

  if (handleInfoClick && infoButton) {
    infoButton.addEventListener('click', (evt) => {
      evt.stopPropagation();
      handleInfoClick(cardData._id);
    });
  }

  return cardElement;
};
