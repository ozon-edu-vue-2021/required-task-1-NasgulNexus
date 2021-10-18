'use strict';

const action = document.querySelector('.action');
const templateImageCard = document.querySelector('#image');
const templateImagePopup = document.querySelector('#popup-image');
const container = document.querySelector('.images');

const popup = document.querySelector('.popup');
const popupContainer = document.querySelector('.popup .content');
const popupClose = document.querySelector('.popup .action');
const loader = document.querySelector('.loader');

const MAX_PAGE_IAMGES = 34;
let loaderTimeout;

/**
 * Функция задаёт первоначальное состояние страницы.
 * Отправляется первый запрос за картинками, юез параметров т.к. с дефолтными настройками.
 */
const initialState = function () {
    action.disabled = false;
    getPictures();
}

/**
 * Функция запрашивает картинки для галереи
 * и вызывает ф-цию отрисовки полученных картинок
 * @param {number} page
 * @param {number} limit
 */
const getPictures = function (page = 1, limit = 10) {
    showLoader();
    fetch(`https://picsum.photos/v2/list?page=${page};limit=${limit}`)
        .then(function (response) {return response.json()})
        .then(function (result) {renderPictures(result)})
}

/**
 * Функция запрашивает информацию о конкретной картинке по её id
 * и вызывает ф-цию для отрисовки картинки в попапе
 * @param {number} id
 */
const getPictureInfo = function (id = 0) {
    showLoader();
    fetch(`https://picsum.photos/id/${id}/info`)
        .then(function (response) {return response.json()})
        .then(function (result) {renderPopupPicture(result)})
}

/**
 * Функция показывает индикатор загрузки.
 * Меняет ситили, ничего не возвращает.
 */
const showLoader = function () {
    loader.style.visibility = 'visible';
}

/**
 * Функция скрывает индикатор загрузки.
 * Удаляет таймаут индикатора, ничего не возвращает.
 */
const hideLoader = function () {
    loaderTimeout = setTimeout(function () {
        loader.style.visibility = 'hidden';
        loaderTimeout.clearTimeout();
    }, 700);
}

/**
 * Функция пропорционально делит размер картинки,
 * чтобы в превью не загружать слишком большие картинки,
 * которые возвращает сервис
 * @param {string} src
 * @param {number} size
 */
const cropImage = function (src, size = 2) {
    const [domain, key, id, width, height] = src.split('/').splice(2);
    const newWidth = Math.floor(+width / size);
    const newHeight = Math.floor(+height / size);

    return `https://${domain}/${key}/${id}/${newWidth}/${newHeight}`;
}

/**
 * Функция копирует шаблон для каждой картинки,
 * заполняет его и встраивает в разметку
 * @param {array} list
 */
const renderPictures = function (list) {
    if (!list.length) {
        throw Error(`Pictures not defined. The list length: ${list.length}`);
    }

    const clone = templateImageCard.content.cloneNode(true);
    const fragment = document.createDocumentFragment();

    list.forEach(function (element) {
        const link = clone.querySelector('a');

        link.href = element.url;
        link.dataset.id = element.id;

        const image = clone.querySelector('img');
        image.src = cropImage(element.download_url, 5);
        image.alt = element.author;
        image.classList.add('preview');
        fragment.appendChild(clone)
    });

    container.appendChild(fragment);
    hideLoader();
}

/**
 * Функция копирует шаблон для картинки в попапе,
 * заполняет его и встраивает в попап
 * @param {object} picture
 */
const renderPopupPicture = function (picture) {
    const clone = templateImagePopup.content.cloneNode(true);
    const img = clone.querySelector('img');
    const link = clone.querySelector('a');
    const author = clone.querySelector('.author');

    img.src = cropImage(picture.download_url, 2);
    img.alt = picture.author;
    author.textContent = picture.author;
    img.width = picture.width / 10;
    link.href = picture.download_url;

    popupContainer.innerHTML = '';
    popupContainer.appendChild(clone)
    hideLoader();
    togglePopup();
}

/**
 * Функция переклбчает класс открытия на попапе
 */
const togglePopup = function () {
    popup.classList.toggle('open');
}

/**
 * @type {object} MouseEvent
 */

/**
 * Обработчик кнопки подгрузки картинок
 * @param {MouseEvent} evt
 */
const actionHandler = function (evt) {
    evt.preventDefault();
    const nextPage = evt.currentTarget.dataset.page;
    evt.currentTarget.dataset.page = nextPage + 1;

    if (nextPage > MAX_PAGE_IAMGES) {
        console.warn(`WARN: You are trying to call a page that exceeds ${MAX_PAGE_IAMGES}`);
        evt.currentTarget.disabled = true;
    } else {
        getPictures(nextPage);
    }
}

/**
 * Обработчик события click по картинкам.
 * Запрашивает данные по картинке, на которую кликнули,
 * для открытия попапа с ней
 * @param {MouseEvent} evt
 */
const imageHandler = function (evt) {
    evt.preventDefault();

    if (evt.target.closest('a')) {
        getPictureInfo(evt.target.dataset.id);
    }
}

action.addEventListener('click', actionHandler);
container.addEventListener('click', imageHandler);
popupClose.addEventListener('click', togglePopup);

initialState();
