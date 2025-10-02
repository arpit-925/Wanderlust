if (listing.geometry && Array.isArray(listing.geometry.coordinates)) {
  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates, // [lng, lat]
    zoom: 10
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${listing.title}</h5><p>${listing.location}</p>`)
    )
    .addTo(map);
} else {
  console.error("Invalid coordinates for this listing:", listing);
}
