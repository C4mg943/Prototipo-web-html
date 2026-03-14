window.initMap = function() {

  const centro = { lat: 11.22769, lng: -74.18696 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: centro,
    mapTypeId: "satellite"
  });

  const marcadores = [
    { nombre: "Cancha 1", lat: 11.227645, lng: -74.187154 },
    { nombre: "Cancha 2", lat: 11.227718, lng: -74.186705 },
    { nombre: "Cancha 3", lat: 11.227754, lng: -74.186298 },
    { nombre: "Cancha 4", lat: 11.227907, lng: -74.185939 },
    { nombre: "Cancha 5", lat: 11.227134, lng: -74.185691 },
    { nombre: "Cancha 8", lat: 11.227980, lng: -74.185704 },
    { nombre: "Cancha 6", lat: 11.227516, lng: -74.184646 },
    { nombre: "Cancha 7", lat: 11.225953, lng: -74.184287 }
  ];

  marcadores.forEach(punto => {

    const marker = new google.maps.Marker({
      position: { lat: punto.lat, lng: punto.lng },
      map: map,
      title: punto.nombre
    });

    const info = new google.maps.InfoWindow({
      content: `<b>${punto.nombre}</b>`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });

  });

};