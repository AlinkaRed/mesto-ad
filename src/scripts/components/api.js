// src/scripts/components/api.js

const config = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-202',
  headers: {
    authorization: '87e5607f-6be9-4cbe-a478-d5f95d4ed19d',
    'Content-Type': 'application/json'
  }
};

// Универсальная функция для проверки ответа от сервера
const handleResponse = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка: ${response.status}`);
};

// Получение информации о пользователе
export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers
  }).then(handleResponse);
};

// Получение списка карточек
export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers
  }).then(handleResponse);
};

// Обновление данных профиля (имя и описание)
export const setUserInfo = (userData) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify(userData)
  }).then(handleResponse);
};

// Обновление аватара
export const setAvatarInfo = (avatarData) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify(avatarData)
  }).then(handleResponse);
};

// Добавление новой карточки
export const addCard = (cardData) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(cardData)
  }).then(handleResponse);
};

// Удаление карточки по ID
export const deleteCard = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: config.headers
  }).then(handleResponse);
};

// Постановка или снятие лайка
export const changeLikeCardStatus = (cardId, isLiked) => {
  const method = isLiked ? 'DELETE' : 'PUT';
  return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method,
    headers: config.headers
  }).then(handleResponse);
};