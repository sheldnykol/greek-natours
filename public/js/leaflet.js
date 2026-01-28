/* eslint-disable */
export const displayMap = (locations) => {
  // 1. Δημιουργία του χάρτη
  const map = L.map('map', { 
    scrollWheelZoom: false,
    dragging: true // Ενεργό dragging για όλους
  });

  // 2. Προσθήκη των Modern Tiles (CartoDB Positron)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);

  const points = [];

  // 3. Προσθήκη Markers για κάθε τοποθεσία
  locations.forEach((loc) => {
    // Στο Leaflet οι συντεταγμένες είναι [lat, lng]
    const currPoint = [loc.coordinates[1], loc.coordinates[0]];
    points.push(currPoint);

    // Προετοιμασία του Google Maps Search Query με το όνομα του μέρους
    const searchQuery = encodeURIComponent(`${loc.description}, Greece`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

    // Δημιουργία του Marker
    const marker = L.marker(currPoint).addTo(map);

    // Προσθήκη του Tooltip (Το όνομα που φαίνεται ΜΟΝΙΜΑ πάνω από την πινέζα)
    marker.bindTooltip(`${loc.description}`, {
      permanent: true,
      direction: 'top',
      className: 'island-label', // Χρησιμοποιεί το CSS που φτιάξαμε
      offset: [0, -15],
      opacity: 0.9
    }).openTooltip();

    // Προσθήκη του Popup (Ανοίγει όταν κάνεις κλικ για το Google Maps)
    marker.bindPopup(`
      <div style="text-align: center; padding: 5px;">
        <h3 style="margin-bottom: 8px; font-size: 1.6rem; color: #1e40af; font-family: 'Inter', sans-serif;">${loc.description}</h3>
        <p style="margin-bottom: 12px; font-size: 1.2rem; color: #6b7280;">Day ${loc.day} of the adventure</p>
        <a href="${googleMapsUrl}" 
           target="_blank" 
           class="btn btn--blue btn--small" 
           style="color: white; text-decoration: none; display: inline-block; font-size: 1.1rem; padding: 8px 15px; border-radius: 5px;">
           Explore on Google Maps →
        </a>
      </div>
    `, {
      maxWidth: 250,
      className: 'modern-popup'
    });
  });

  // 4. Προσαρμογή του χάρτη ώστε να φαίνονται όλα τα σημεία (Bounds)
  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  // 5. Responsive Check: Απενεργοποίηση scrollWheelZoom στα κινητά
  if (window.innerWidth < 768) {
    map.scrollWheelZoom.disable();
  }
};