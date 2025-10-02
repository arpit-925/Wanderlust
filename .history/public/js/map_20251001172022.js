
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

if (listing.geometry && Array.isArray(listing.geometry.coordinates)) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates,
    zoom: 7
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${listing.title}</h5><p>${listing.location}</p>`)
    )
    .addTo(map);
}

