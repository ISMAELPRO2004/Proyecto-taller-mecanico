import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoEmpresa from '../assets/logoEmpresa.png';

let logoDataUrlPromise = null;

const cargarLogoDataUrl = () => {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch(logoEmpresa)
      .then((r) => r.blob())
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }))
      .catch(() => null);
  }
  return logoDataUrlPromise;
};

/**
 * Construye el PDF de una orden (mismo formato para descargar o imprimir).
 */
async function construirDocumento(orden, verPrecios) {
  const doc = new jsPDF();
  const verdeLyer = [6, 78, 59];
  const verdeAccent = [16, 185, 129];
  const logoDataUrl = await cargarLogoDataUrl();

  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 42, 'F');

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 12, 6, 58, 30);
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('LYER MOTORS', 15, 22);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`ORDEN DE TRABAJO`, 130, 18);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  doc.text(`${orden.numeroOrden}`, 130, 26);
  doc.setFontSize(9);
  doc.text(`Fecha: ${new Date(orden.fechaCreacion).toLocaleDateString('es-PE')}`, 130, 34);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', 15, 55);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${orden.cliente?.nombreRazonSocial || '—'}`, 15, 62);
  doc.text(`Celular: ${orden.cliente?.celular || 'N/A'}`, 15, 68);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('ESPECIFICACIONES DEL VEHÍCULO', 15, 80);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Placa: ${orden.placa}`, 15, 87);
  doc.text(`Unidad: ${orden.vehiculo?.marca?.nombre || ''} ${orden.vehiculo?.modelo || ''}`, 15, 93);
  doc.text(`Recorrido: ${orden.vehiculo?.kilometraje ?? '—'} KM / ${orden.vehiculo?.horometro ?? '—'} H`, 15, 99);

  let currentY = 110;
  if (orden.materiales?.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [verPrecios
        ? ['Cant.', 'Descripción de Repuestos', 'Unitario', 'Total']
        : ['Cant.', 'Descripción de Repuestos']],
      body: orden.materiales.map(m => verPrecios
        ? [
          m.cantidad,
          m.material.descripcion,
          `S/ ${Number(m.precioAplicado).toFixed(2)}`,
          `S/ ${(Number(m.cantidad) * Number(m.precioAplicado)).toFixed(2)}`
        ]
        : [m.cantidad, m.material.descripcion]),
      headStyles: { fillColor: verdeLyer, fontSize: 10 },
      theme: 'striped'
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  const servicios = [
    ...(orden.servicios || []).map(s => verPrecios
      ? [s.descripcion, `S/ ${Number(s.monto).toFixed(2)}`]
      : [s.descripcion]),
    ...(orden.terceros || []).map(t => verPrecios
      ? [`(Tercero) ${t.descripcion}`, `S/ ${Number(t.monto).toFixed(2)}`]
      : [`(Tercero) ${t.descripcion}`])
  ];

  if (servicios.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [verPrecios ? ['Descripción de Servicios', 'Monto'] : ['Descripción de Servicios']],
      body: servicios,
      headStyles: { fillColor: verdeAccent, fontSize: 10 },
      theme: 'grid'
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  if (verPrecios) {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const totalMateriales = (orden.materiales || []).reduce(
      (acc, m) => acc + Number(m.cantidad || 0) * Number(m.precioAplicado || 0),
      0
    );
    const totalServicios = (orden.servicios || []).reduce((acc, s) => acc + Number(s.monto || 0), 0);
    const totalTerceros = (orden.terceros || []).reduce((acc, t) => acc + Number(t.monto || 0), 0);
    const total = Math.round((totalMateriales + totalServicios + totalTerceros) * 100) / 100;
    doc.text(`INVERSIÓN TOTAL: S/ ${total.toFixed(2)}`, 130, currentY);
  }

  return doc;
}

/**
 * Genera el PDF de una OT.
 * @param {'imprimir'|'descargar'} [opciones.accion='imprimir']
 */
export async function generarOrdenPDF(orden, { verPrecios = true, accion = 'imprimir' } = {}) {
  if (!orden) return;

  const doc = await construirDocumento(orden, verPrecios);

  if (accion === 'descargar') {
    doc.save(`OT_${orden.numeroOrden}.pdf`);
    return;
  }

  doc.autoPrint();
  const url = doc.output('bloburl');
  const ventana = window.open(url, '_blank');
  if (!ventana) {
    doc.save(`OT_${orden.numeroOrden}.pdf`);
  }
}
