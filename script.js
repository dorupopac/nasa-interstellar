///////////////////////////////////////
// APPLICATION ARCHITECTURE
const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const loader = document.querySelector('.loader');
const favoritesBtn = document.getElementById('favorites');
const loadMoreBtn = document.getElementById('load-more');
const loadMoreNasaBtn = document.getElementById('load-more-nasa');

class App {
  #resultsArr = [];
  #favorites = {};
  // NASA API
  #count = 10;
  #API_KEY = 'DEMO_KEY';
  #API_URL = `https://api.nasa.gov/planetary/apod?api_key=${
    this.#API_KEY
  }&count=${this.#count}`;

  constructor() {
    // Executed on app load
    this._getNasaPictures();

    // Event Listeners
    favoritesBtn.addEventListener('click', () => this._updateDOM('favorites'));
    loadMoreBtn.addEventListener('click', () => this._getNasaPictures());
    loadMoreNasaBtn.addEventListener('click', () => this._getNasaPictures());
  }

  _showContent(page) {
    window.scrollTo({ top: 0, behavior: 'instant'})
    if(page === 'results') {
      favoritesNav.classList.add('hidden')
      resultsNav.classList.remove('hidden');
    } else {
      resultsNav.classList.add('hidden');
      favoritesNav.classList.remove('hidden')
    }
    loader.classList.add('hidden');
  }

  _createDOMNodes(page) {
    const currArr =
      page === 'results' ? this.#resultsArr : Object.values(this.#favorites);
    currArr.forEach(result => {
      // Card Container
      const card = document.createElement('div');
      card.classList.add('card');
      // Link
      const link = document.createElement('a');
      link.href = result.hdurl;
      link.title = 'View Full Image';
      link.target = '_blank';
      // Image
      const image = document.createElement('img');
      image.src = result.url;
      image.alt = 'NASA Picture of the Day';
      image.loading = 'lazy';
      image.classList.add('card-img-top');
      // Card Body
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');
      // Card Title
      const cardTitle = document.createElement('h5');
      cardTitle.classList.add('card-title');
      cardTitle.textContent = result.title;
      // Save Text
      const saveText = document.createElement('p');
      saveText.classList.add('clickable');
      saveText.textContent =
        page === 'results' ? 'Add to Favorites' : 'Remove Favorite';
      saveText.addEventListener('click', e => {
        page === 'results'
          ? this._saveFavorite(result.url)
          : this._removeFavorite(result.url, e);
      });
      // Card Text
      const cardText = document.createElement('p');
      cardText.textContent = result.explanation;
      // Footer Container
      const footer = document.createElement('small');
      footer.classList.add('text-muted');
      // Date
      const date = document.createElement('strong');
      date.textContent = result.date;
      // Copyright
      const copyright = document.createElement('span');
      if (result.copyright) {
        copyright.textContent = ` ${result.copyright}`;
      }

      // Appending the elements
      card.append(link, cardBody);
      link.appendChild(image);
      cardBody.append(cardTitle, saveText, cardText, footer);
      footer.append(date, copyright);
      imagesContainer.appendChild(card);
    });
  }

  _updateDOM(page) {
    this._getItemsFromLocalStorage();
    imagesContainer.textContent = '';
    this._createDOMNodes(page);
    this._showContent(page);
  }

  _saveFavorite(itemUrl) {
    // Loop through Results Array to select Favorite
    this.#resultsArr.forEach(result => {
      if (result.url.includes(itemUrl) && !this.#favorites[itemUrl]) {
        this.#favorites[itemUrl] = result;
        console.log(this.#favorites);
        // Show Save Confirmation for 2 seconds
        saveConfirmed.hidden = false;
        setTimeout(() => (saveConfirmed.hidden = true), 2000);
        // Save favorite items to localStorage
        localStorage.setItem('favorites', JSON.stringify(this.#favorites));
      }
    });
  }

  // Remove item from Favorites
  _removeFavorite(itemUrl, e) {
    if (this.#favorites[itemUrl]) delete this.#favorites[itemUrl];
    // Update localStorage
    localStorage.setItem('favorites', JSON.stringify(this.#favorites));
    // Remove element from DOM
    e.target.closest('.card').remove();
  }

  // Get favorites from localStorage on load
  _getItemsFromLocalStorage() {
    if (localStorage.getItem('favorites')) {
      this.#favorites = JSON.parse(localStorage.getItem('favorites'));
    }
  }

  // Get 10 Images from NASA API
  async _getNasaPictures() {
    // Show Loader
    loader.classList.remove('hidden');
    try {
      const res = await fetch(this.#API_URL);
      this.#resultsArr = await res.json();
      this._updateDOM('results');
    } catch (err) {
      console.error(err.message);
    }
  }
}

const app = new App();
