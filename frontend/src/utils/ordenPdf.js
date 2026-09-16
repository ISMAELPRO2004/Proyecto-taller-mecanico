import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Genera y descarga el PDF de una orden de trabajo.
 * @param {object} orden - Orden con detalle (materiales, servicios, terceros)
 */
export function generarOrdenPDF(orden) {
  if (!orden) return;

  const doc = new jsPDF();
  const verdeLyer = [6, 78, 59];
  const verdeAccent = [16, 185, 129];

  doc.setFillColor(...verdeLyer);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('LYER MOTORS', 15, 20);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`ORDEN DE TRABAJO: ${orden.numeroOrden}`, 15, 30);
  doc.text(`Fecha: ${new Date(orden.fechaCreacion).toLocaleDateString()}`, 155, 25);

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', 15, 50);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Nombre: ${orden.cliente?.nombreRazonSocial || '—'}`, 15, 57);
  doc.text(`Celular: ${orden.cliente?.celular || 'N/A'}`, 15, 63);

  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text('ESPECIFICACIONES DEL VEHÍCULO', 15, 75);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(`Placa: ${orden.placa}`, 15, 82);
  doc.text(`Unidad: ${orden.vehiculo?.marca?.nombre || ''} ${orden.vehiculo?.modelo || ''}`, 15, 88);
  doc.text(`Recorrido: ${orden.vehiculo?.kilometraje ?? '—'} KM / ${orden.vehiculo?.horometro ?? '—'} H`, 15, 94);

  let currentY = 105;
  if (orden.materiales?.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Cant.', 'Descripción de Repuestos', 'Unitario', 'Total']],
      body: orden.materiales.map(m => [
        m.cantidad,
        m.material.descripcion,
        `S/ ${Number(m.precioAplicado).toFixed(2)}`,
        `S/ ${(Number(m.cantidad) * Number(m.precioAplicado)).toFixed(2)}`
      ]),
      headStyles: { fillColor: verdeLyer, fontSize: 10 },
      theme: 'striped'
    });
    currentY = doc.lastAutoTable.finalY + 10;
  }

  const servicios = [
    ...(orden.servicios || []).map(s => [s.descripcion, `S/ ${Number(s.monto).toFixed(2)}`]),
    ...(orden.terceros || []).map(t => [`(Tercero) ${t.descripcion}`, `S/ ${Number(t.monto).toFixed(2)}`])
  ];

  if (servicios.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Descripción de Servicios', 'Monto']],
      body: servicios,
      headStyles: { fillColor: verdeAccent, fontSize: 10 },
      theme: 'grid'
    });
    currentY = doc.lastAutoTable.finalY + 15;
  }

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`INVERSIÓN TOTAL: S/ ${Number(orden.totalFinal).toFixed(2)}`, 130, currentY);
  doc.save(`OT_${orden.numeroOrden}.pdf`);
}
