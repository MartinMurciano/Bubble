export default function Footer() {
  return (
  <div className="footer">

    <div className="ft-main">
      <div className="ft-main-item">
        <h2 className="ft-title">Sobre nosotros</h2>
        <ul>
          <li><a href="/app/about.html">Conocenos</a></li>
          <li><a href="/app/testimonios.html">Testimonios</a></li>
        </ul>
      </div>
      <div className="ft-main-item">
        <h2 className="ft-title">Legales</h2>
        <ul>
          <li><a href="#">Términos y condiciones</a></li>
        </ul>
      </div>
      <div className="ft-main-item">
        <h2 className="ft-title">Contacto</h2>
        <ul className="">
          <li><a href="#"><i className="contacto-redes fab fa-facebook"></i>Facebook</a></li>
          <li><a href="#"><i className="contacto-redes fab fa-twitter"></i>Twitter</a></li>
          <li><a href="#"><i className="contacto-redes fab fa-instagram"></i>Instagram</a></li>
          <li><a href="/app/contacto.html"><i className="contacto-redes fa-regular fa-envelope"></i>Formulario</a></li>
        </ul>
      </div>

    <section className="ft-social">
      <small>
        Importante: Bubble no se hace responsable de la calidad o satisfacción de los eventos publicados. Bubble es un sistema que presta el servicio de venta de entradas online. Al usar este sitio usted acepta los términos y condiciones de la aplicación. Copyright © 2024 Bubble.
      </small>
    </section>
  </div>
  </div>
  );
}