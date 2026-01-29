/* eslint-disable */
export const displayMap = (locations) => {
  const map = L.map('map', { 
    scrollWheelZoom: false,
    dragging: true,
    maxZoom: 15 // Εμποδίζει το υπερβολικό zoom-out
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const points = [];

  locations.forEach((loc) => {
    const currPoint = [loc.coordinates[1], loc.coordinates[0]];
    points.push(currPoint);

    const searchQuery = encodeURIComponent(`${loc.description}, Greece`);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;

    const customLabel = L.divIcon({
      className: 'custom-map-label',
      html: `
        <a href="${googleMapsUrl}" target="_blank" class="map-label-wrapper">
          <div class="map-label-day">Day ${loc.day}</div>
          <div class="map-label-name">${loc.description}</div>
        </a>
      `,
      iconSize: [100, 40], // Μικρότερο container
      iconAnchor: [50, 55]  // Προσαρμογή ώστε να κάθεται ακριβώς πάνω από την πινέζα
    });

    L.marker(currPoint).addTo(map);
    L.marker(currPoint, { icon: customLabel }).addTo(map);
  });

  // 0.2 αντί για 0.5 για να κάνει ΠΙΟ ΠΟΛΥ ZOOM (λιγότερο κενό γύρω γύρω)
  const bounds = L.latLngBounds(points).pad(0.2); 
  map.fitBounds(bounds);

  if (window.innerWidth < 768) {
    map.scrollWheelZoom.disable();
  }
};