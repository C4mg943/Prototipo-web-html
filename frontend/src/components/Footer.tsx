export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <div className="footer-grid" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="footer-info">
          <p className="footer-names">
            Camilo Monsalve <span>•</span> Valentina Masso <span>•</span> Camilo Serpa
          </p>
          <p className="footer-project">Proyecto web 2026</p>
        </div>
      </div>

      <div className="footer-right">
        <img src="/assets/logo.png" alt="Universidad del Magdalena" />
        <div className="footer-separator" />
        <img src="/assets/extra.png" alt="Logo Extra" />
      </div>
    </footer>
  );
}
