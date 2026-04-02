export function LocationSection() {
  return (
    <section id="ubicacion" className="location-section">
      <div className="location-info">
        <h2>
          Nuestra
          <br />
          ubicación
        </h2>
        <p>
          Carrera 32 No 22-08,
          <br />
          Santa Marta, Magdalena
          <br />
          470004
        </p>
        <a
          href="https://maps.app.goo.gl/iuD1MHD24KqgGoSbA"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-mapa"
        >
          Ir al mapa →
        </a>
      </div>

      <div className="map-container">
        <iframe
          title="Mapa Universidad del Magdalena"
          src="https://www.google.com/maps?q=Universidad+del+Magdalena&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="map-iframe"
        />
      </div>
    </section>
  );
}
