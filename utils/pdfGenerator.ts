
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Company, Equipment, Collaborator, SoftwareLicense } from '../types';

// Helper to convert SVG Base64 to PNG Base64 for jsPDF
const svgToPng = (svgBase64: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = svgBase64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject('Canvas context failed');
      }
    };
    img.onerror = reject;
  });
};

// --- ACTA DE ENTREGA DE EQUIPOS (HARDWARE) ---
export const generateHandoverPDF = async (
  company: Company, 
  equipment: Equipment, 
  collaborator: Collaborator
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // --- HEADER ---
  try {
    const logoPng = await svgToPng(company.logo, 300, 100);
    doc.addImage(logoPng, 'PNG', 15, 10, 40, 15);
  } catch (e) {
    console.error("Error cargando logo", e);
    doc.setFontSize(10);
    doc.text(company.name.toUpperCase(), 15, 20);
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTA DE ENTREGA DE ACTIVOS TI', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(15, 30, pageWidth - 15, 30);

  // --- SECCIÓN 1: DATOS DEL COLABORADOR ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. DATOS DEL RESPONSABLE (RECEPTOR)', 15, 40);

  autoTable(doc, {
    startY: 45,
    head: [['Nombre Completo', 'Cargo', 'Área / Departamento']],
    body: [
      [
        `${collaborator.firstName} ${collaborator.lastName}`,
        collaborator.cargo,
        collaborator.area
      ]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    styles: { cellPadding: 3 }
  });

  // --- SECCIÓN 2: DATOS DEL EQUIPO ---
  const finalY1 = (doc as any).lastAutoTable.finalY || 60;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DETALLES DEL ACTIVO', 15, finalY1 + 10);

  const equipData = [
    ['Tipo de Equipo', equipment.type],
    ['Marca', equipment.brand],
    ['Modelo', equipment.model],
    ['Número de Serie (SN)', equipment.serialNumber],
    ['Estado Actual', equipment.status],
    ['Ubicación Asignada', equipment.location]
  ];

  if (equipment.type !== 'Periférico') {
    if (equipment.processor) equipData.push(['Procesador', equipment.processor]);
    if (equipment.ram) equipData.push(['Memoria RAM', equipment.ram]);
    if (equipment.storage) equipData.push(['Almacenamiento', equipment.storage]);
    if (equipment.os) equipData.push(['Sistema Operativo', equipment.os]);
  } else if (equipment.peripheralType) {
    equipData.push(['Tipo Periférico', equipment.peripheralType]);
  }

  autoTable(doc, {
    startY: finalY1 + 15,
    body: equipData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' }
    }
  });

  // --- SECCIÓN 3: COMPROMISO ---
  const finalY2 = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. TÉRMINOS Y CONDICIONES DE USO', 15, finalY2 + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const termsText = `
El colaborador declara recibir el equipo descrito anteriormente en las condiciones estipuladas.
1. El equipo es propiedad exclusiva de ${company.name} y se entrega para el desempeño de sus funciones laborales.
2. El colaborador se compromete a cuidar el equipo, reportar cualquier fallo inmediatamente y no instalar software no autorizado.
3. En caso de pérdida o daño por negligencia comprobada, la empresa podrá tomar las medidas administrativas correspondientes según la política interna.
4. Al finalizar la relación laboral o cuando sea requerido, el colaborador deberá devolver el equipo y sus accesorios completos.
  `;
  
  doc.text(termsText, 15, finalY2 + 15, { maxWidth: pageWidth - 30, lineHeightFactor: 1.5 });

  // --- FIRMAS ---
  const signatureY = finalY2 + 70;
  
  doc.setLineWidth(0.2);
  
  // Firma Entregado Por
  doc.line(20, signatureY, 80, signatureY);
  doc.text('ENTREGADO POR', 50, signatureY + 5, { align: 'center' });
  doc.text('Departamento TI', 50, signatureY + 10, { align: 'center' });

  // Firma Recibido Por
  doc.line(120, signatureY, 180, signatureY);
  doc.text('RECIBIDO POR', 150, signatureY + 5, { align: 'center' });
  doc.text(`${collaborator.firstName} ${collaborator.lastName}`, 150, signatureY + 10, { align: 'center' });
  doc.text(`CC / ID: __________________`, 150, signatureY + 15, { align: 'center' });

  // Guardar PDF
  doc.save(`Acta_Entrega_${equipment.serialNumber}_${collaborator.lastName}.pdf`);
};

// --- ACTA DE ENTREGA DE LICENCIAS (SOFTWARE) ---
export const generateLicenseHandoverPDF = async (
  company: Company, 
  license: SoftwareLicense, 
  assignee: Collaborator | Equipment,
  assigneeType: 'person' | 'equipment'
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // --- HEADER ---
  try {
    const logoPng = await svgToPng(company.logo, 300, 100);
    doc.addImage(logoPng, 'PNG', 15, 10, 40, 15);
  } catch (e) {
    doc.setFontSize(10);
    doc.text(company.name.toUpperCase(), 15, 20);
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ASIGNACIÓN DE LICENCIA DE SOFTWARE', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Asignación: ${new Date().toLocaleDateString()}`, pageWidth - 15, 20, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(15, 30, pageWidth - 15, 30);

  // --- SECCIÓN 1: BENEFICIARIO / ASIGNADO ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. ASIGNADO A', 15, 40);

  const tableData = [];
  if (assigneeType === 'person') {
      const user = assignee as Collaborator;
      tableData.push([`Nombre: ${user.firstName} ${user.lastName}`, `Cargo: ${user.cargo}`, `Área: ${user.area}`]);
  } else {
      const equip = assignee as Equipment;
      tableData.push([`Equipo: ${equip.type} ${equip.brand} ${equip.model}`, `Serial: ${equip.serialNumber}`, `Ubicación: ${equip.location}`]);
  }

  autoTable(doc, {
    startY: 45,
    body: tableData,
    theme: 'grid',
    styles: { cellPadding: 3, fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  // --- SECCIÓN 2: DETALLES DE LA LICENCIA ---
  const finalY1 = (doc as any).lastAutoTable.finalY || 60;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DETALLES DEL SOFTWARE', 15, finalY1 + 10);

  const licData = [
    ['Nombre del Software', license.name],
    ['Proveedor / Fabricante', license.vendor],
    ['Tipo de Licencia', license.type],
    ['Fecha de Inicio', license.startDate],
    ['Fecha de Vencimiento', license.expirationDate],
    ['Clave de Producto (Key)', license.key]
  ];

  autoTable(doc, {
    startY: finalY1 + 15,
    body: licData,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 'auto', font: 'courier' }
    }
  });

  // --- SECCIÓN 3: POLÍTICAS ---
  const finalY2 = (doc as any).lastAutoTable.finalY || 120;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('3. POLÍTICAS DE USO Y CONFIDENCIALIDAD', 15, finalY2 + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const policyText = `
El usuario o responsable del equipo asignado acepta las siguientes condiciones:
1. La licencia de software entregada es propiedad intelectual del fabricante y licenciada a ${company.name}.
2. Queda estrictamente prohibida la divulgación, copia o distribución de la Clave de Producto (Key) a terceros ajenos a la organización.
3. El software debe ser utilizado exclusivamente para fines laborales relacionados con la compañía.
4. Cualquier intento de piratería, modificación no autorizada o uso indebido será sancionado conforme a las políticas internas y la legislación vigente.
5. Al finalizar la relación laboral o cambio de equipo, la licencia podrá ser revocado y reasignada por el departamento de TI.
  `;
  
  doc.text(policyText, 15, finalY2 + 15, { maxWidth: pageWidth - 30, lineHeightFactor: 1.5 });

  // --- FIRMA (Solo si es persona, si es equipo firma el responsable de TI) ---
  const signatureY = finalY2 + 70;
  doc.setLineWidth(0.2);
  
  doc.line(20, signatureY, 80, signatureY);
  doc.text('AUTORIZADO POR (TI)', 50, signatureY + 5, { align: 'center' });

  if (assigneeType === 'person') {
      doc.line(120, signatureY, 180, signatureY);
      doc.text('RECIBIDO POR', 150, signatureY + 5, { align: 'center' });
      const user = assignee as Collaborator;
      doc.text(`${user.firstName} ${user.lastName}`, 150, signatureY + 10, { align: 'center' });
  }

  // Guardar PDF
  const filename = assigneeType === 'person' 
    ? `Licencia_${license.name}_${(assignee as Collaborator).lastName}.pdf`
    : `Licencia_${license.name}_${(assignee as Equipment).serialNumber}.pdf`;
    
  doc.save(filename);
};
