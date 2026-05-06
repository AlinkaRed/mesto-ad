// src/scripts/components/api.js

const apiConfig = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-202',
  headers: {
    authorization: '4262c96a-b4d8-4d78-9b89-55fb30abfb9e',
    'Content-Type': 'application/json'
  }
};

const getResponseData = (response) => {
  return response.ok
    ? response.json()
    : Promise.reject(`Ошибка: ${response.status}`);
};

export const getUserInfo = () => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    headers: apiConfig.headers
  }).then(getResponseData);
};

export const getCardList = () => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    headers: apiConfig.headers
  }).then(getResponseData);
};

export const setUserInfo = ({ name, about }) => {
  return fetch(`${apiConfig.baseUrl}/users/me`, {
    method: 'PATCH',
    headers: apiConfig.headers,
    body: JSON.stringify({ name, about })
  }).then(getResponseData);
};

export const updateUserAvatar = ({ avatar }) => {
  return fetch(`${apiConfig.baseUrl}/users/me/avatar`, {
    method: 'PATCH',
    headers: apiConfig.headers,
    body: JSON.stringify({ avatar })
  }).then(getResponseData);
};

export const addCard = (cardData) => {
  return fetch(`${apiConfig.baseUrl}/cards`, {
    method: 'POST',
    headers: apiConfig.headers,
    body: JSON.stringify(cardData)
  }).then(getResponseData);
};

export const deleteCard = (cardId) => {
  return fetch(`${apiConfig.baseUrl}/cards/${cardId}`, {
    method: 'DELETE',
    headers: apiConfig.headers
  }).then(getResponseData);
};

export const changeLikeCardStatus = (cardId, isLiked) => {
  return fetch(`${apiConfig.baseUrl}/cards/likes/${cardId}`, {
    method: isLiked ? 'DELETE' : 'PUT',
    headers: apiConfig.headers
  }).then(getResponseData);
};