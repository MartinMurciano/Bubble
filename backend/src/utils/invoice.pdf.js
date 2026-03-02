import PDFDocument from "pdfkit";

/**
 * Genera un PDF de factura y lo devuelve como Buffer
 * @param {Object} data - { factura, detalles, usuario }
 */
export function generateInvoicePDF({ factura, detalles, usuario }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const purple = "#A380A9";
    const lightPurple = "#f0ebff";
    const dark = "#1a1a1a";
    const muted = "#666666";
    const pageWidth = doc.page.width - 100; // margen izq + der

    // ── ENCABEZADO ────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(purple);

    doc
      .fillColor("#fff")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text("Bubble", 50, 28);

    doc
      .fontSize(10)
      .text("FACTURA", doc.page.width - 130, 30, { width: 80, align: "right" })
      .fontSize(16)
      .font("Helvetica-Bold")
      .text(`#${String(factura.id_factura).padStart(6, "0")}`, doc.page.width - 130, 46, { width: 80, align: "right" });

    doc.moveDown(3);

    // ── INFO CLIENTE + FECHA ───────────────────────────────────────────────────
    const infoY = 110;

    doc.fillColor(dark).fontSize(10).font("Helvetica-Bold").text("DATOS DEL CLIENTE", 50, infoY);
    doc
      .font("Helvetica")
      .fillColor(muted)
      .fontSize(10)
      .text(`Nombre: ${usuario.nombre} ${usuario.apellido}`, 50, infoY + 16)
      .text(`Email: ${usuario.email}`, 50, infoY + 30);

    doc.fillColor(dark).fontSize(10).font("Helvetica-Bold").text("FECHA DE EMISIÓN", 350, infoY);
    doc
      .font("Helvetica")
      .fillColor(muted)
      .fontSize(10)
      .text(
        new Date(factura.fecha_emision).toLocaleDateString("es-AR", {
        day: "2-digit", month: "long", year: "numeric",
      }),
        350, infoY + 16
      );

    doc.fillColor(dark).fontSize(10).font("Helvetica-Bold").text("ESTADO", 350, infoY + 40);
    doc.font("Helvetica").fillColor("#28a745").fontSize(10).text(factura.estado_pago, 350, infoY + 56);

    // ── LÍNEA SEPARADORA ──────────────────────────────────────────────────────
    doc.moveTo(50, 190).lineTo(545, 190).strokeColor("#e1d5e0").stroke();

    // ── TABLA DE DETALLES ─────────────────────────────────────────────────────
    let y = 210;

    // Cabecera tabla
    doc.rect(50, y, pageWidth, 24).fill(lightPurple);
    doc.fillColor(purple).fontSize(9).font("Helvetica-Bold");
    doc.text("EVENTO", 58, y + 7);
    doc.text("TIPO", 260, y + 7);
    doc.text("FECHA", 340, y + 7);
    doc.text("CANT.", 430, y + 7);
    doc.text("SUBTOTAL", 470, y + 7, { width: 70, align: "right" });

    y += 28;

    // Filas
    detalles.forEach((d, idx) => {
      const rowH = 44;
      if (idx % 2 === 0) {
        doc.rect(50, y, pageWidth, rowH).fill("#fafafa");
      }

      doc.fillColor(dark).fontSize(9).font("Helvetica-Bold")
        .text(d.evento, 58, y + 6, { width: 195, ellipsis: true });

      doc.font("Helvetica").fillColor(muted)
        .text(d.ciudad || "", 58, y + 20, { width: 195 });

      doc.fillColor(dark).fontSize(9)
        .text(d.tipo_entrada, 260, y + 6, { width: 75 });

      const fechaStr = d.fecha_hora
        ? new Date(d.fecha_hora).toLocaleDateString("es-AR", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "-";
      doc.text(fechaStr, 340, y + 6, { width: 84 });

      doc.text(String(d.cantidad), 430, y + 6, { width: 35, align: "center" });

      doc.fillColor(purple).font("Helvetica-Bold")
        .text(`$${Number(d.subtotal).toLocaleString("es-AR")}`, 470, y + 6, { width: 70, align: "right" });

      // Códigos de ticket
      if (d.codigos?.length) {
        const codigosStr = d.codigos.map((c) => c.codigo).join("  ·  ");
        doc.fillColor(muted).font("Helvetica").fontSize(7)
          .text(`Tickets: ${codigosStr}`, 58, y + 28, { width: 480 });
      }

      y += rowH + 4;
    });

    // ── TOTAL ──────────────────────────────────────────────────────────────────
    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#e1d5e0").stroke();
    y += 12;

    doc.rect(370, y, 175, 36).fill(purple);
    doc.fillColor("#fff").fontSize(11).font("Helvetica-Bold")
      .text("TOTAL", 380, y + 10);
    doc.fontSize(14)
      .text(`$${Number(factura.total).toLocaleString("es-AR")}`, 380, y + 10, { width: 155, align: "right" });

    // ── MÉTODO DE PAGO ────────────────────────────────────────────────────────
    y += 50;
    doc.fillColor(muted).fontSize(9).font("Helvetica")
      .text(`Método de pago: Tarjeta`, 50, y);

    // ── FOOTER ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e1d5e0").stroke();
    doc.fillColor(muted).fontSize(8).font("Helvetica")
      .text(
        "Muchas gracias por tu",
        50, footerY + 10, { width: pageWidth, align: "center" }
      );

    doc.end();
  });
}
