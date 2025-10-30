import ApiService from '../../data/api.js';
import CONFIG from '../../utils/config.js';
import { showLoading, hideLoading, showAlert, formatDate } from '../../utils/index.js';

class HomePage {
  constructor() {
    this.map = null;
    this.markers = [];
    this.stories = [];
    this.activeMarkerId = null;
  }

  async render() {
    return `
      <div class="home-header">
        <h2 class="page-title">Story Map</h2>
        <a href="#/create" class="btn-create">
          Add Story
        </a>
      </div>

      <div class="filter-section">
        <label for="locationFilter">Filter by Location</label>
        <select id="locationFilter" class="form-input">
          <option value="all">All Stories</option>
          <option value="with-location">With Location Only</option>
        </select>
      </div>

      <div class="home-content">
        <div class="map-container">
          <div id="map" role="application" aria-label="Interactive map showing story locations"></div>
        </div>
        <div class="stories-list" id="storiesList" role="list">
          <!-- Stories will be rendered here -->
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Wait for Leaflet to load
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded!');
      showAlert('Map library failed to load. Please refresh the page.', 'error');
      return;
    }

    this._initMap();
    await this._loadStories();
    this._setupEventListeners();
  }

  _initMap() {
    try {
      // Check if map container exists
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map container not found!');
        return;
      }

      // Initialize map
      this.map = L.map('map').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);

      // Add tile layers with layer control
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: CONFIG.MAX_ZOOM,
      });

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: CONFIG.MAX_ZOOM,
      });

      osmLayer.addTo(this.map);

      const baseMaps = {
        'Street Map': osmLayer,
        'Satellite': satelliteLayer,
      };

      L.control.layers(baseMaps).addTo(this.map);
      
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      showAlert('Failed to initialize map', 'error');
    }
  }

  async _loadStories() {
    try {
      showLoading();
      const response = await ApiService.getStories(1);
      this.stories = response.listStory || [];
      
      this._renderStories();
      this._addMarkersToMap();
      
      hideLoading();
    } catch (error) {
      hideLoading();
      showAlert(error.message || 'Failed to load stories', 'error');
    }
  }

  _renderStories(filteredStories = null) {
    const storiesList = document.getElementById('storiesList');
    const storiesToRender = filteredStories || this.stories;

    if (storiesToRender.length === 0) {
      storiesList.innerHTML = `
        <div class="story-card">
          <div class="story-content">
            <p>No stories found. Be the first to share your story!</p>
          </div>
        </div>
      `;
      return;
    }

    storiesList.innerHTML = storiesToRender.map((story, index) => `
      <article class="story-card" data-story-id="${story.id}" data-index="${index}" role="listitem" tabindex="0">
        <img 
          src="${story.photoUrl}" 
          alt="${this._escapeHtml(story.name)}" 
          class="story-image"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 fill=%22%2364748b%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22system-ui%22%3EImage not available%3C/text%3E%3C/svg%3E'"
        >
        <div class="story-content">
          <h3 class="story-name">${this._escapeHtml(story.name)}</h3>
          <p class="story-description">${this._escapeHtml(story.description)}</p>
          <div class="story-meta">
            <span class="story-meta-item">${formatDate(story.createdAt)}</span>
            ${story.lat && story.lon ? `
              <span class="story-meta-item">${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
            ` : ''}
          </div>
        </div>
      </article>
    `).join('');

    // Add click and keyboard event listeners
    document.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => this._handleStoryClick(card));
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._handleStoryClick(card);
        }
      });
    });
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _addMarkersToMap() {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    const bounds = [];

    this.stories.forEach((story, index) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon])
          .bindPopup(`
            <div style="min-width: 200px;">
              <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
              <h4 style="margin: 0 0 8px 0; font-size: 1rem;">${story.name}</h4>
              <p style="margin: 0; font-size: 0.875rem; color: #64748b;">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
            </div>
          `)
          .addTo(this.map);

        marker.storyId = story.id;
        marker.storyIndex = index;

        marker.on('click', () => {
          this._highlightStory(story.id);
          this._scrollToStory(index);
        });

        this.markers.push(marker);
        bounds.push([story.lat, story.lon]);
      }
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  _handleStoryClick(card) {
    const storyId = card.dataset.storyId;
    const index = parseInt(card.dataset.index);
    
    this._highlightStory(storyId);
    
    const story = this.stories[index];
    if (story.lat && story.lon) {
      this.map.setView([story.lat, story.lon], 15);
      
      const marker = this.markers.find(m => m.storyId === storyId);
      if (marker) {
        marker.openPopup();
      }
    }
  }

  _highlightStory(storyId) {
    document.querySelectorAll('.story-card').forEach(card => {
      card.classList.remove('active');
    });
    
    const activeCard = document.querySelector(`[data-story-id="${storyId}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
    }

    this.activeMarkerId = storyId;
  }

  _scrollToStory(index) {
    const cards = document.querySelectorAll('.story-card');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      cards[index].focus();
    }
  }

  _setupEventListeners() {
    const filterSelect = document.getElementById('locationFilter');
    
    filterSelect.addEventListener('change', (e) => {
      const filterValue = e.target.value;
      
      if (filterValue === 'with-location') {
        const filtered = this.stories.filter(story => story.lat && story.lon);
        this._renderStories(filtered);
      } else {
        this._renderStories();
      }
    });
  }
}

export default HomePage;