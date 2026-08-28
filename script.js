// ── BASE DE DATOS DE SENSORES FOTOGRAMÉTRICOS ACTUALES ─────────────────────
const SENSORS = {
  // ── SERIE MAVIC 3 ENTERPRISE
  mavic3_ent: {
    name: 'DJI Mavic 3 Enterprise (M3E)',
    sensorWidth: 17.3,    // mm (4/3" CMOS)
    sensorHeight: 13.0,   // mm
    imgWidth: 5280,       // px (20 MP)
    imgHeight: 3956,      // px
    focalLength: 12.29,   // mm (equiv. 24mm)
    shutter: 'Mecánico'
  },
  mavic3_multispectral: {
    name: 'DJI Mavic 3 Multispectral (M3M)',
    sensorWidth: 17.3,    // mm (4/3" CMOS RGB)
    sensorHeight: 13.0,   // mm
    imgWidth: 5280,       // px (20 MP)
    imgHeight: 3956,      // px
    focalLength: 12.29,   // mm
    shutter: 'Mecánico'
  },
  mavic3_thermal_rgb: {
    name: 'DJI Mavic 3 Thermal (M3T - RGB)',
    sensorWidth: 6.4,     // mm (1/2" CMOS)
    sensorHeight: 4.8,    // mm
    imgWidth: 8000,       // px (48 MP)
    imgHeight: 6000,      // px
    focalLength: 4.4,     // mm (equiv. 24mm)
    shutter: 'Electrónico'
  },

  // ── SERIE MATRICE & ZENMUSE
  matrice_4e: {
    name: 'DJI Matrice 4E (M4E Surveying)',
    sensorWidth: 17.3,    // mm (4/3" CMOS Alta Velocidad)
    sensorHeight: 13.0,   // mm
    imgWidth: 5280,       // px (20 MP)
    imgHeight: 3956,      // px
    focalLength: 12.29,   // mm
    shutter: 'Mecánico'
  },
  dji_zenmuse_p1: {
    name: 'DJI Zenmuse P1 (Matrice 350/300 RTK - 35mm)',
    sensorWidth: 35.9,    // mm (Full Frame 35mm)
    sensorHeight: 24.0,   // mm
    imgWidth: 8192,       // px (45 MP)
    imgHeight: 5460,      // px
    focalLength: 35.0,    // mm
    shutter: 'Mecánico'
  },
  dji_zenmuse_l2_rgb: {
    name: 'DJI Zenmuse L2 / L1 (RGB Coaxial LiDAR)',
    sensorWidth: 17.3,    // mm (4/3" CMOS)
    sensorHeight: 13.0,   // mm
    imgWidth: 5280,       // px (20 MP)
    imgHeight: 3956,      // px
    focalLength: 12.29,   // mm
    shutter: 'Mecánico'
  },
  matrice_30t: {
    name: 'DJI Matrice 30T (M30T - Gran Angular)',
    sensorWidth: 6.4,     // mm (1/2" CMOS)
    sensorHeight: 4.8,    // mm
    imgWidth: 8000,       // px (48 MP)
    imgHeight: 6000,      // px
    focalLength: 4.5,     // mm (equiv. 24mm)
    shutter: 'Electrónico'
  },

  // ── ALA FIJA & PLATAFORMAS DE ALTA RESOLUCIÓN
  wingtra_rx1r2: {
    name: 'WingtraOne GEN II (Sony RX1R II)',
    sensorWidth: 35.9,    // mm (Full Frame)
    sensorHeight: 24.0,   // mm
    imgWidth: 7952,       // px (42.4 MP)
    imgHeight: 5304,      // px
    focalLength: 35.0,    // mm
    shutter: 'Mecánico'
  },
  phantom4_rtk: {
    name: 'DJI Phantom 4 RTK',
    sensorWidth: 13.2,    // mm (1" CMOS)
    sensorHeight: 8.8,    // mm
    imgWidth: 5472,       // px (20 MP)
    imgHeight: 3648,      // px
    focalLength: 8.8,     // mm
    shutter: 'Mecánico'
  }
};

// ── CÁLCULO DE PARÁMETROS FOTOGRAMÉTRICOS (GSD, HUELLA & ESCALA) ───────────
function calculateGSD() {
  const selectEl = document.getElementById('sensor-select');
  if (!selectEl) return;
  
  const sensorKey = selectEl.value;
  const heightEl = document.getElementById('flight-height');
  const height = heightEl ? parseFloat(heightEl.value) : 80;
  const sensor = SENSORS[sensorKey] || SENSORS.mavic3_ent;

  // Actualizar etiqueta de altura
  const heightValEl = document.getElementById('height-val');
  if (heightValEl) heightValEl.textContent = height;

  // GSD = (H_m * 100 * Sw_mm) / (f_mm * Iw_px)  -> cm/px
  const gsd = (height * 100 * sensor.sensorWidth) / (sensor.focalLength * sensor.imgWidth);

  // Huella en terreno = (H * Sw) / f  -> metros
  const footprintW = (height * sensor.sensorWidth) / sensor.focalLength;
  const footprintH = (height * sensor.sensorHeight) / sensor.focalLength;

  // Escala fotográfica = H / (f / 1000)
  const scaleDenominator = Math.round((height * 1000) / sensor.focalLength);

  // Mostrar resultados
  const resGsd = document.getElementById('res-gsd');
  const resFootprint = document.getElementById('res-footprint');
  const resScale = document.getElementById('res-scale');

  if (resGsd) resGsd.textContent = `${gsd.toFixed(2)} cm/px`;
  if (resFootprint) resFootprint.textContent = `${Math.round(footprintW)} × ${Math.round(footprintH)} m`;
  if (resScale) resScale.textContent = `1 : ${scaleDenominator.toLocaleString()}`;
}

// ── DESLIZADOR COMPARADOR DE CAPAS (RGB/TÉRMICA vs DEM) ──────────────────────
function slideLayer(val) {
  const overlay = document.getElementById('layer-rgb');
  if (overlay) {
    overlay.style.clipPath = `inset(0 ${100 - val}% 0 0)`;
  }
}

// ── FILTRO DE LEVANTAMIENTOS FOTOGRAMÉTRICOS ───────────────────────────────
function filterSurveys(category) {
  const pills = document.querySelectorAll('.filter-pills .pill');
  pills.forEach(pill => pill.classList.remove('active'));

  const clickedPill = Array.from(pills).find(p => {
    const txt = p.textContent.toLowerCase();
    if (category === 'all' && txt.includes('todos')) return true;
    if (category === 'investigacion' && (txt.includes('investigación') || txt.includes('termografía'))) return true;
    if (category === 'emergencia' && (txt.includes('sismo') || txt.includes('misión') || txt.includes('emergencia'))) return true;
    if (category === 'infraestructura' && (txt.includes('infraestructura') || txt.includes('topografía') || txt.includes('apr'))) return true;
    if (category === 'obra' && (txt.includes('obra') || txt.includes('qa/qc'))) return true;
    return false;
  });
  if (clickedPill) clickedPill.classList.add('active');

  const cards = document.querySelectorAll('.survey-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  // Revalidar dimensiones de mapas Leaflet tras cambiar visibilidad
  setTimeout(() => {
    if (hualcapoMapInstance) hualcapoMapInstance.invalidateSize();
    if (caraballedaMapInstance) caraballedaMapInstance.invalidateSize();
  }, 100);
}

// ── VISOR MODAL LIGHTBOX INTERACTIVO (ZOOM & PAN) ──────────────────────────
let modalScale = 1;
let modalTranslateX = 0;
let modalTranslateY = 0;
let isDraggingModal = false;
let startDragX = 0;
let startDragY = 0;

function updateModalTransform() {
  const img = document.getElementById('modal-img');
  if (img) {
    img.style.transform = `translate(${modalTranslateX}px, ${modalTranslateY}px) scale(${modalScale})`;
  }
}

function openOrthoModal(src, title, caption, downloadUrl) {
  const modal = document.getElementById('ortho-modal');
  const img = document.getElementById('modal-img');
  const titleEl = document.getElementById('modal-title');
  const captionEl = document.getElementById('modal-caption');
  const downloadEl = document.getElementById('modal-download');

  if (!modal || !img) return;

  img.src = src;
  if (titleEl) titleEl.textContent = title || 'Inspección de Ortomosaico';
  if (captionEl) captionEl.textContent = caption || '';
  if (downloadEl) {
    downloadEl.href = downloadUrl || src;
    downloadEl.download = title ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg` : 'ortomosaico.jpg';
  }

  // Restablecer zoom y posición
  modalScale = 1;
  modalTranslateX = 0;
  modalTranslateY = 0;
  updateModalTransform();

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
}

function closeModalDirect() {
  const modal = document.getElementById('ortho-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function closeModal(event) {
  if (event.target.id === 'ortho-modal') {
    closeModalDirect();
  }
}

function zoomModal(factor) {
  modalScale = Math.min(Math.max(modalScale * factor, 0.6), 6.0);
  updateModalTransform();
}

function resetZoomModal() {
  modalScale = 1;
  modalTranslateX = 0;
  modalTranslateY = 0;
  updateModalTransform();
}

// Eventos de Paneo y Rueda de Zoom en el Modal
function initModalEvents() {
  const wrapper = document.getElementById('modal-body');
  const img = document.getElementById('modal-img');

  if (!wrapper || !img) return;

  // Zoom con rueda del ratón
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    zoomModal(zoomFactor);
  }, { passive: false });

  // Paneo con arrastre del ratón
  img.addEventListener('mousedown', (e) => {
    isDraggingModal = true;
    startDragX = e.clientX - modalTranslateX;
    startDragY = e.clientY - modalTranslateY;
    img.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingModal) return;
    modalTranslateX = e.clientX - startDragX;
    modalTranslateY = e.clientY - startDragY;
    updateModalTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDraggingModal) {
      isDraggingModal = false;
      const modalImg = document.getElementById('modal-img');
      if (modalImg) modalImg.style.cursor = 'grab';
    }
  });

  // Soporte táctil en móviles (Touch pan y pinch zoom)
  let initialTouchDistance = 0;
  let initialScale = 1;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDraggingModal = true;
      startDragX = e.touches[0].clientX - modalTranslateX;
      startDragY = e.touches[0].clientY - modalTranslateY;
    } else if (e.touches.length === 2) {
      isDraggingModal = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDistance = Math.sqrt(dx * dx + dy * dy);
      initialScale = modalScale;
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (isDraggingModal && e.touches.length === 1) {
      modalTranslateX = e.touches[0].clientX - startDragX;
      modalTranslateY = e.touches[0].clientY - startDragY;
      updateModalTransform();
    } else if (e.touches.length === 2 && initialTouchDistance > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = currentDistance / initialTouchDistance;
      modalScale = Math.min(Math.max(initialScale * scaleChange, 0.6), 6.0);
      updateModalTransform();
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    isDraggingModal = false;
    initialTouchDistance = 0;
  }, { passive: true });

  // Cerrar con tecla Escape o Zoom con teclas + / -
  window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('ortho-modal');
    if (!modal || !modal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeModalDirect();
    } else if (e.key === '+' || e.key === '=') {
      zoomModal(1.2);
    } else if (e.key === '-' || e.key === '_') {
      zoomModal(0.8);
    } else if (e.key === '0') {
      resetZoomModal();
    }
  });
}

// ── GENERADOR LIGERO DE CÓDIGO QR SVG ───────────────────────────────────────
function initQRCode() {
  const container = document.getElementById('qr-code');
  if (!container) return;

  const qrSvg = `
    <svg width="64" height="64" viewBox="0 0 25 25" fill="#1e40af" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="7" height="7" fill="none" stroke="#1e40af" stroke-width="1.2"/>
      <rect x="4" y="4" width="3" height="3" fill="#1e40af"/>
      
      <rect x="16" y="2" width="7" height="7" fill="none" stroke="#1e40af" stroke-width="1.2"/>
      <rect x="18" y="4" width="3" height="3" fill="#1e40af"/>
      
      <rect x="2" y="16" width="7" height="7" fill="none" stroke="#1e40af" stroke-width="1.2"/>
      <rect x="4" y="18" width="3" height="3" fill="#1e40af"/>
      
      <rect x="10" y="3" width="1.5" height="1.5"/>
      <rect x="13" y="3" width="1.5" height="1.5"/>
      <rect x="11" y="6" width="1.5" height="1.5"/>
      <rect x="10" y="10" width="1.5" height="1.5"/>
      <rect x="13" y="10" width="1.5" height="1.5"/>
      <rect x="3" y="11" width="1.5" height="1.5"/>
      <rect x="6" y="12" width="1.5" height="1.5"/>
      <rect x="16" y="11" width="1.5" height="1.5"/>
      <rect x="19" y="12" width="1.5" height="1.5"/>
      <rect x="21" y="10" width="1.5" height="1.5"/>
      <rect x="11" y="14" width="1.5" height="1.5"/>
      <rect x="14" y="15" width="1.5" height="1.5"/>
      <rect x="10" y="18" width="1.5" height="1.5"/>
      <rect x="13" y="19" width="1.5" height="1.5"/>
      <rect x="17" y="16" width="1.5" height="1.5"/>
      <rect x="20" y="18" width="1.5" height="1.5"/>
      <rect x="16" y="21" width="1.5" height="1.5"/>
      <rect x="19" y="21" width="1.5" height="1.5"/>
      <rect x="21" y="19" width="1.5" height="1.5"/>
    </svg>
  `;
  container.innerHTML = qrSvg;
}

// ── VISOR WEBMAP LEAFLET INTERACTIVO (APR HUALCAPO / HIJUELAS) ──────────────
let hualcapoMapInstance = null;
let hualcapoQgisLayer = null;

function initHualcapoMap() {
  const mapContainer = document.getElementById('hualcapo-map');
  if (!mapContainer || hualcapoMapInstance || typeof L === 'undefined') return;

  // Inicializar mapa centrado en el APR de Hualcapo, Hijuelas
  hualcapoMapInstance = L.map('hualcapo-map', {
    attributionControl: true,
    scrollWheelZoom: false // Evita captura accidental del scroll de página
  }).setView([-32.8935, -71.0963], 17);

  // Permitir scroll zoom tras interactuar con el mapa
  mapContainer.addEventListener('click', () => {
    if (hualcapoMapInstance) hualcapoMapInstance.scrollWheelZoom.enable();
  });

  // Capa Base Satelital (Esri World Imagery)
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Esri Satellite'
  }).addTo(hualcapoMapInstance);

  // Capa Base Cartográfica (OpenStreetMap)
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  });

  // Capa de Teselas Locales QGIS (Levantamiento y Trazado APR)
  hualcapoQgisLayer = L.tileLayer('assets/tiles_hualcapo/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 20,
    tms: false,
    opacity: 0.9,
    attribution: 'QGIS APR Hualcapo'
  }).addTo(hualcapoMapInstance);

  // Selector de Capas
  const baseMaps = {
    "🛰️ Satelital (Esri)": esriSatellite,
    "🗺️ OpenStreetMap": osm
  };
  const overlayMaps = {
    "📐 Trazado & Topografía APR (QGIS)": hualcapoQgisLayer
  };

  L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(hualcapoMapInstance);
  L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(hualcapoMapInstance);
}

function setHualcapoOpacity(val) {
  if (hualcapoQgisLayer) {
    hualcapoQgisLayer.setOpacity(parseFloat(val));
  }
}

function resetHualcapoView() {
  if (hualcapoMapInstance) {
    hualcapoMapInstance.setView([-32.8935, -71.0963], 17);
  }
}

// ── VISOR WEBMAP LEAFLET INTERACTIVO (CARABALLEDA / MISIÓN VENEZUELA) ───────
let caraballedaMapInstance = null;
let caraballedaQgisLayer = null;

function initCaraballedaMap() {
  const mapContainer = document.getElementById('caraballeda-map');
  if (!mapContainer || caraballedaMapInstance || typeof L === 'undefined') return;

  // Inicializar mapa centrado en Caraballeda, La Guaira, Venezuela
  caraballedaMapInstance = L.map('caraballeda-map', {
    attributionControl: true,
    scrollWheelZoom: false
  }).setView([10.6172, -66.849], 18);

  mapContainer.addEventListener('click', () => {
    if (caraballedaMapInstance) caraballedaMapInstance.scrollWheelZoom.enable();
  });

  // Capa Base Satelital (Esri World Imagery)
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Esri Satellite'
  }).addTo(caraballedaMapInstance);

  // Capa Base Cartográfica (OpenStreetMap)
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  });

  // Capa de Teselas Locales QGIS (Ortomosaico Caraballeda)
  caraballedaQgisLayer = L.tileLayer('assets/tiles_caraballeda/{z}/{x}/{y}.png', {
    minZoom: 15,
    maxZoom: 20,
    tms: false,
    opacity: 0.95,
    attribution: 'Misión Venezuela · Ortomosaico Caraballeda'
  }).addTo(caraballedaMapInstance);

  // Selector de Capas
  const baseMaps = {
    "🛰️ Satelital (Esri)": esriSatellite,
    "🗺️ OpenStreetMap": osm
  };
  const overlayMaps = {
    "🏙️ Ortomosaico Post-Sismo (QGIS)": caraballedaQgisLayer
  };

  L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(caraballedaMapInstance);
  L.control.scale({ metric: true, imperial: false, position: 'bottomleft' }).addTo(caraballedaMapInstance);
}

function setCaraballedaOpacity(val) {
  if (caraballedaQgisLayer) {
    caraballedaQgisLayer.setOpacity(parseFloat(val));
  }
}

function resetCaraballedaView() {
  if (caraballedaMapInstance) {
    caraballedaMapInstance.setView([10.6172, -66.849], 18);
  }
}

// ── INICIALIZACIÓN ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  calculateGSD();
  initQRCode();
  initModalEvents();
  initHualcapoMap();
  initCaraballedaMap();

  setTimeout(() => {
    if (hualcapoMapInstance) hualcapoMapInstance.invalidateSize();
    if (caraballedaMapInstance) caraballedaMapInstance.invalidateSize();
  }, 350);
});

window.addEventListener('resize', () => {
  if (hualcapoMapInstance) hualcapoMapInstance.invalidateSize();
  if (caraballedaMapInstance) caraballedaMapInstance.invalidateSize();
});

