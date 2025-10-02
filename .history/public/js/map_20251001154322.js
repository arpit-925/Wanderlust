
// mapboxgl.accessToken = mapToken;

// const map = new mapboxgl.Map({
//   container: "map", // container ID
//   style: "mapbox://styles/mapbox/streets-v12",
//   center: listing.geometry.coordinates, // [lng, lat]
//   zoom: 7
// });

// new mapboxgl.Marker({ color: "red" })
//   .setLngLat(listing.geometry.coordinates)
//   .setPopup(
//     new mapboxgl.Popup({ offset: 25 })
//       .setHTML(`<h5>${listing.title}</h5><p>${listing.location}</p>`)
//   )
//   .addTo(map);
if (window.listing?.geometry?.coordinates?.length === 2) {
  mapboxgl.accessToken = window.mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: window.listing.geometry.coordinates, // [lng, lat]
    zoom: 7
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(window.listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${window.listing.title}</h5><p>${window.listing.location}</p>`)
    )
    .addTo(map);
} else {
  document.getElementById("map").innerHTML = "Location not available";
}
