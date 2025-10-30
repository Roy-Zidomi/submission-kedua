import ApiService from '../../data/api.js';
import CONFIG from '../../utils/config.js';
import { showLoading, hideLoading, showAlert } from '../../utils/index.js';

class CreatePage {
  constructor() {
    this.map = null;
    this.selectedLocation = null;
    this.locationMarker = null;
    this.selectedFile = null;
    this.stream = null;
  }

  async render() {
    return `
      <div class="create-container">
        <div class="home-header">
          <h2 class="page-title">Create New Story</h2>
        </div>

        <form id="createForm" class="create-form" novalidate>
          <!-- Image Upload Section -->
          <div class="form-section">
            <h3 class="form-section-title">Story Image</h3>
            
            <div class="form-group">
              <label for="photoInput" class="form-label">Choose Image File</label>
              <div class="image-upload-area" id="uploadArea">
                <p>Drag and drop an image here, or click to browse</p>
                <input 
                  type="file" 
                  id="photoInput" 
                  name="photo"
                  accept="image/*" 
                  class="file-input"
                  aria-label="Upload story image"
                  aria-describedby="photo-error"
                >
              </div>
            </div>

            <div class="camera-controls">
              <button type="button" id="openCameraBtn" class="btn btn-secondary">
                Buka Kamera
              </button>
              <button type="button" id="captureBtn" class="btn hidden">
                Ambil Poto
              </button>
              <button type="button" id="closeCameraBtn" class="btn btn-outline hidden">
                Tutup Kamera
              </button>
            </div>

            <video id="cameraPreview" class="hidden" autoplay playsinline aria-label="Camera preview"></video>
            
            <div id="imagePreview" class="image-preview hidden">
              <img id="previewImg" src="" alt="Story preview">
              <button type="button" id="removeImageBtn" class="btn btn-secondary" style="margin-top: 0.5rem;">
                Hapus Gambar
              </button>
            </div>
            <span id="photo-error" class="error-message" role="alert"></span>
          </div>

          <!-- Story Details Section -->
          <div class="form-section">
            <h3 class="form-section-title">Story Details</h3>
            
            <div class="form-group">
              <label for="description" class="form-label">Description</label>
              <textarea 
                id="description" 
                name="description" 
                class="textarea" 
                placeholder="Tell your story..."
                required
                aria-required="true"
                aria-describedby="description-error"
              ></textarea>
              <span id="description-error" class="error-message" role="alert"></span>
            </div>
          </div>

          <!-- Location Section -->
          <div class="form-section">
            <h3 class="form-section-title">Location</h3>
            <p class="location-hint">Click on the map to select a location for your story</p>
            
            <div id="locationMap" role="application" aria-label="Interactive map for selecting story location"></div>
            
            <div id="coordinatesDisplay" class="coordinates-display hidden">
              <strong>Selected Location:</strong><br>
              Latitude: <span id="selectedLat">-</span><br>
              Longitude: <span id="selectedLon">-</span>
            </div>
            <span id="location-error" class="error-message" role="alert"></span>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" id="cancelBtn" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn">Publish Story</button>
          </div>
        </form>
      </div>
    `;
  }

  async afterRender() {
    this._initMap();
    this._setupEventListeners();
  }

  _initMap() {
    this.map = L.map('locationMap').setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: CONFIG.MAX_ZOOM,
    }).addTo(this.map);

    //Klik peta untuk memilih lokasi
    this.map.on('click', (e) => {
      this._setLocation(e.latlng);
    });
  }

  _setLocation(latlng) {
    this.selectedLocation = latlng;

    // Hapus marker yang sudah ada
    if (this.locationMarker) {
      this.map.removeLayer(this.locationMarker);
    }
    //Tambahkan marker baru
    this.locationMarker = L.marker([latlng.lat, latlng.lng])
      .addTo(this.map)
      .bindPopup('Story location')
      .openPopup();

    //Perbarui tampilan
    document.getElementById('coordinatesDisplay').classList.remove('hidden');
    document.getElementById('selectedLat').textContent = latlng.lat.toFixed(6);
    document.getElementById('selectedLon').textContent = latlng.lng.toFixed(6);
    document.getElementById('location-error').textContent = '';
  }

  _setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const photoInput = document.getElementById('photoInput');
    const form = document.getElementById('createForm');
    const cancelBtn = document.getElementById('cancelBtn');

    // File upload - input change
    photoInput.addEventListener('change', (e) => this._handleFileSelect(e));

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this._displayImage(file);
      }
    });

    // Camera controls
    document.getElementById('openCameraBtn').addEventListener('click', () => this._openCamera());
    document.getElementById('captureBtn').addEventListener('click', () => this._capturePhoto());
    document.getElementById('closeCameraBtn').addEventListener('click', () => this._closeCamera());

    // Remove image
    document.getElementById('removeImageBtn').addEventListener('click', () => this._removeImage());

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit();
    });

    // Cancel button
    cancelBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin membatalkan? Semua perubahan akan hilang.')) {
        this._closeCamera();
        window.location.hash = '#/home';
      }
    });
  }

  _handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this._displayImage(file);
    }
  }

  _displayImage(file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('previewImg').src = e.target.result;
      document.getElementById('imagePreview').classList.remove('hidden');
      document.getElementById('uploadArea').style.display = 'none';
      document.getElementById('photo-error').textContent = '';
    };
    reader.readAsDataURL(file);
  }

  _removeImage() {
    this.selectedFile = null;
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('photoInput').value = '';
  }

  async _openCamera() {
    try {
      console.log('Membuka Kamera...');
      
      // Request camera access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false 
      });

      const video = document.getElementById('cameraPreview');
      const uploadArea = document.getElementById('uploadArea');
      const openCameraBtn = document.getElementById('openCameraBtn');
      const captureBtn = document.getElementById('captureBtn');
      const closeCameraBtn = document.getElementById('closeCameraBtn');

      video.srcObject = this.stream;
      video.classList.remove('hidden');
      uploadArea.style.display = 'none';

      // Hide/show buttons
      openCameraBtn.classList.add('hidden');
      captureBtn.classList.remove('hidden');
      closeCameraBtn.classList.remove('hidden');

      console.log('Camera opened successfully');
      showAlert('Camera ready! Click "Capture Photo" to take a picture.', 'success');
    } catch (error) {
      console.error('Camera error:', error);
      
      let errorMessage = 'Unable to access camera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Harap izinkan akses kamera di pengaturan browser Anda.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Tidak ada kamera yang ditemukan pada perangkat ini.';
      } else {
        errorMessage += error.message;
      }
      
      showAlert(errorMessage, 'error');
    }
  }

  _capturePhoto() {
    console.log('Mengambil Poto.');
    
    const video = document.getElementById('cameraPreview');
    const canvas = document.createElement('canvas');
    //Atur ukuran kanvas sesuai dimensi video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    //Gambar bingkai video ke kanvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    //Ubah kanvas menjadi blob dan buat file
    canvas.toBlob((blob) => {
      const timestamp = new Date().getTime();
      const file = new File([blob], `camera-photo-${timestamp}.jpg`, { type: 'image/jpeg' });
      
      this._displayImage(file);
      this._closeCamera();
      
      console.log('Foto berhasil diambilPhoto captured successfully');
      showAlert('Foto diambil! Sekarang kamu dapat menambahkan deskripsi dan lokasi', 'success');
    }, 'image/jpeg', 0.95);
  }

  _closeCamera() {
    console.log(' Menutup Kamera...');
    //Hentikan semua track video
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });
      this.stream = null;
    }

    const video = document.getElementById('cameraPreview');
    const uploadArea = document.getElementById('uploadArea');
    const openCameraBtn = document.getElementById('openCameraBtn');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');

    video.classList.add('hidden');
    video.srcObject = null;

    // Show/hide buttons
    openCameraBtn.classList.remove('hidden');
    captureBtn.classList.add('hidden');
    closeCameraBtn.classList.add('hidden');
    
    // Show upload area if no image selected
    if (!this.selectedFile) {
      uploadArea.style.display = 'block';
    }

    console.log('Camera ditutup');
  }

  async _handleSubmit() {
    let isValid = true;

    // Validate image
    if (!this.selectedFile) {
      document.getElementById('photo-error').textContent = 'Please select an image';
      isValid = false;
    }

    // Validate description
    const description = document.getElementById('description').value.trim();
    if (!description) {
      document.getElementById('description-error').textContent = 'Description is required';
      isValid = false;
    } else {
      document.getElementById('description-error').textContent = '';
    }

    // Validate location
    if (!this.selectedLocation) {
      document.getElementById('location-error').textContent = 'Please select a location on the map';
      isValid = false;
    }

    if (!isValid) return;

    // Create FormData
    const formData = new FormData();
    formData.append('photo', this.selectedFile);
    formData.append('description', description);
    formData.append('lat', this.selectedLocation.lat);
    formData.append('lon', this.selectedLocation.lng);

    try {
      showLoading();
      await ApiService.createStory(formData);
      
      this._closeCamera();
      showAlert('Story published successfully!', 'success');
      
      setTimeout(() => {
        window.location.hash = '#/home';
      }, 1500);
    } catch (error) {
      hideLoading();
      showAlert(error.message || 'Failed to publish story', 'error');
    } finally {
      hideLoading();
    }
  }
}

export default CreatePage;