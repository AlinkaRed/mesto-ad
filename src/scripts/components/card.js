// src/scripts/components/card.js

const getCardTemplate = () => {
  return document
    .querySelector('#card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCard = (cardData, cardEventHandlers, userId) => {
  const {
    onLikeButtonClick,
    onDeleteButtonClick,
    onImageClick,
    onInfoButtonClick
  } = cardEventHandlers;

  const cardElement = getCardTemplate();
  const cardLikes = cardData.likes || [];

  const cardImage = cardElement.querySelector('.card__image');
  const cardTitle = cardElement.querySelector('.card__title');
  const likeButton = cardElement.querySelector('.card__like-button');
  const likeCountElement = cardElement.querySelector('.card__like-count');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const infoButton = cardElement.querySelector('.card__control-button_type_info');

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;
  likeCountElement.textContent = cardLikes.length;

  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  }

  if (cardLikes.some((likedUser) => likedUser._id === userId)) {
    likeButton.classList.add('card__like-button_is-active');
  }

  if (onLikeButtonClick) {
    likeButton.addEventListener('click', () => {
      onLikeButtonClick(cardData._id, likeButton, likeCountElement);
    });
  }

  if (onDeleteButtonClick && cardData.owner._id === userId) {
    deleteButton.addEventListener('click', () => {
      onDeleteButtonClick(cardData._id, cardElement);
    });
  }

  if (onImageClick) {
    cardImage.addEventListener('click', () => {
      onImageClick({ name: cardData.name, link: cardData.link });
    });
  }

  if (onInfoButtonClick && infoButton) {
    infoButton.addEventListener('click', (event) => {
      event.stopPropagation();
      onInfoButtonClick(cardData._id);
    });
  }

  return cardElement;
};

export const toggleLike = (likeButton, likeCountElement, updatedLikesCount) => {
  likeButton.classList.toggle('card__like-button_is-active');
  likeCountElement.textContent = updatedLikesCount;
};

export const isCardLiked = (likeButton) => {
  return likeButton.classList.contains('card__like-button_is-active');
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};
