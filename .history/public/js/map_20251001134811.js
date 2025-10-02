

//   {/* let mapToken =mapToken; */}
//     mapboxgl.accessToken = mapToken;
//     const map = new mapboxgl.Map({
//         container: 'map', // container ID
//         center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
//         zoom: 7 // starting zoom
//     });

// const marker = new mapboxgl.Marker({color: 'red'})
//     .setLngLat(listing.geometry.coordinates)
//     .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
//     .setHTML(
//       `<h5>${"<%= listing.title %>"}</h5><p>${"<%= listing.location %>"}</p>`
//     ))
//     .addTo(map);

mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates, // [lng, lat]
  zoom: 7
});

new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h5>${listing.title}</h5><p>${listing.location}</p>`)
  )
  .addTo(map);
