import '../css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import { axiosGallery } from './axiosGallery.js';
import countryCardTpl from '../templates/cards.hbs';
import "simplelightbox/dist/simple-lightbox.min.css";

const debounce = require('lodash.debounce');
const axios = require('axios');
// key - твой уникальный ключ доступа к API.
// q - термин для поиска. То, что будет вводить пользователь.
// image_type - тип изображения. Мы хотим только фотографии, поэтому задай значение photo.
// orientation - ориентация фотографии. Задай значение horizontal.
// safesearch - фильтр по возрасту. Задай значение true.
// В ответе будет массив изображений удовлетворивших критериям параметров запроса.
// Каждое изображение описывается объектом, из которого тебе интересны только следующие свойства:

// webformatURL - ссылка на маленькое изображение для списка карточек.
// largeImageURL - ссылка на большое изображение.
// tags - строка с описанием изображения. Подойдет для атрибута alt.
// likes - количество лайков.
// views - количество просмотров.
// comments - количество комментариев.
// downloads - количество загрузок.
// Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло. В таком случае показывай
// уведомление с текстом "Sorry, there are no images matching your search query. Please try again.".
// Для уведомлений используй библиотеку notiflix.

const API_KEY = '24875841-80f192125ca760fadc7a056b3';
const PER_PAGE = 40;
let page = 1;
let searchKey;
let pageAmount;
const searchForm = document.getElementById('search-form');
const searchBtn = document.querySelector('button[type=submit]');
const searchInput = document.querySelector('input[name=searchQuery]');
const gallery = document.querySelector('.gallery');

const newsApiService = new NewsApiService();
console.log(newsApiService); 

const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});

const loadMoreBtn = new LoadMoreBtn({
  selector: '[data-action="load-more"]',
  hidden: true,
});

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.button.addEventListener('click', onLoadMore); 

function onSearchForm(e) {
  e.preventDefault();
  newsApiService.query = searchInput.value.trim();

  if (newsApiService === '') {
      e.currentTarget.reset();
      onFetchError();

      loadMoreBtn.disable();
  }
  
  newsApiService.fetchPhotoCards().then(photos => {
      console.log(photos); 
       
      if (photos.hits.length === 0) {
      onFetchError();
      loadMoreBtn.hide(); 

      } else if (photos.hits.length >= 40) {
          loadMoreBtn.show();
          clearPhotosContainer();
          appendPhotosMarkup(photos);
          
          Notify.success(`Hooray! We found ${photos.totalHits} images.`);
      }
  })
  
  newsApiService.resetPage(); 
  
  e.currentTarget.reset();
  scroll();
}

async function appendPhotosMarkup(photos) {
  const markup = await photoCard(photos.hits);

    gallery.insertAdjacentHTML("beforeend", markup);
  if (photos.hits.length < 40 && photos.hits.length >= 1) {
       onFetchInfo();
       loadMoreBtn.hide();   
  } 
  lightbox.resh('show.simpleLightbox');
}

function scroll() {
  let scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight
  );

  window.scrollBy({
  top: scrollHeight * -2,
  behavior: "auto",
  });
} 

function onLoadMore() {
  loadMoreBtn.disable();
  newsApiService.fetchPhotoCards().then(photos => {
      appendPhotosMarkup(photos);
      loadMoreBtn.enable(); 
  });  
}

function clearPhotosContainer() {
 gallery.innerHTML = '';
}

function onFetchError() {
  Report.failure(
      'Failure',
      "Sorry, there are no images matching your search query. Please try again.",
      'Okay',
  );
}  

function onFetchInfo() {
 Notify.info("We're sorry, but you've reached the end of search results.");
} 

var lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt', 
  captionDelay: 250,
  navText: ['←','→'],
  widthRatio: 0.9,
  heightRatio: 1,
  fadeSpeed: 300,
  spinner: true,
}).resh('show.simpleLightbox');