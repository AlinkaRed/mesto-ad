// src/scripts/components/api.js

const config = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-202',
  headers: {
    authorization: '4262c96a-b4d8-4d78-9b89-55fb30abfb9e',
    'Content-Type': 'application/json'
  }
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers
  }).then(getResponseData);
};

export const getCardList = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers
  }).then(getResponseData);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify({ name, about })
  }).then(getResponseData);
};

export const setAvatarInfo = (avatarData) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: 'PATCH',
    headers: config.headers,
    body: JSON.stringify(avatarData)
  }).then(getResponseData);
};

export const addCard = (cardData) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: 'POST',
    headers: config.headers,
    body: JSON.stringify(cardData)
  }).then(getResponseData);
};

export const deleteCard = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: config.headers
  }).then(getResponseData);
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch(`${config.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? 'DELETE' : 'PUT',
    headers: config.headers
  }).then(getResponseData);
};
