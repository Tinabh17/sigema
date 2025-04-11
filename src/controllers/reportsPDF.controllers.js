import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { getAllUsers } from "../models/user.models.js"
import { getAllAmbientes } from "../models/ambientes.models.js"
import { getAllMaquinas } from "../models/maquinas.models.js";
import { getAllMantenimientosMaquinas } from "../models/mantenimientos_maquinas.models.js";
import { getAllMantenimientosAmbientes } from "../models/mantenimientos_ambientes.models.js";

// Reporte de los Usuarios en PDF

export const getUsersPDF = async (req, res) => {
    try {
        const users = await getAllUsers();
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_usuarios.pdf");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        doc.pipe(res);

        doc.fontSize(20).text("Reporte de Usuarios", { align: "center" });
        doc.moveDown();

        const columns = [
            { label: "Tipo de Documento", prop: "nombre_documento", width: 70 },
            { label: "N° de Documento", prop: "numero_documento", width: 70 },
            { label: "Nombre", prop: "nombre", width: 70 },
            { label: "Apellido", prop: "apellido", width: 70 },
            { label: "Email", prop: "email", width: 105 },
            { label: "Teléfono", prop: "telefono", width: 70 },
            { label: "Dirección", prop: "direccion", width: 100 },
            { label: "Rol", prop: "nombre_rol", width: 70 },
            { label: "Fecha de Registro", prop: "fecha_registro", width: 70 },
        ];

        const columnSpacing = 5;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * columnSpacing;
        const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
        let y = doc.y + 10;
        const rowSpacing = 5;

        // Encabezados con fondo gris
        doc.font("Helvetica-Bold").fontSize(11.5);
        const headerHeight = Math.max(...columns.map(col =>
            doc.heightOfString(col.label, { width: col.width, align: "center" })
        )) + rowSpacing;

        doc.rect(startX, y, totalWidth, headerHeight)
            .fillAndStroke("#eeeeee", "#000000");

        let x = startX;
        columns.forEach(col => {
            const label = col.label;
            const labelHeight = doc.heightOfString(label, { width: col.width, align: "center" });
            const verticalOffset = (headerHeight - labelHeight) / 2;

            doc.fillColor("black").text(label, x, y + verticalOffset, {
                width: col.width,
                align: 'center',
            });
            x += col.width + columnSpacing;
        });

        y += headerHeight;
        doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
        y += 5;

        // Filas de usuarios con estilo zebra
        doc.font("Helvetica").fontSize(10);
        users.forEach((user, index) => {
            let x = startX;

            const rowHeights = columns.map(col => {
                let value = user[col.prop] ?? "";
                if (col.prop === "fecha_registro") {
                    const fecha = value ? new Date(value) : null;
                    value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
                }
                return doc.heightOfString(value.toString(), {
                    width: col.width,
                    align: "left"
                });
            });

            const rowHeight = Math.max(...rowHeights) + rowSpacing;

            if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;

                // Redibujar encabezados con fondo gris
                doc.font("Helvetica-Bold").fontSize(11.5);
                doc.rect(startX, y, totalWidth, headerHeight)
                    .fillAndStroke("#eeeeee", "#000000");

                x = startX;
                columns.forEach(col => {
                    const label = col.label;
                    const labelHeight = doc.heightOfString(label, { width: col.width, align: "center" });
                    const verticalOffset = (headerHeight - labelHeight) / 2;

                    doc.fillColor("black").text(label, x, y + verticalOffset, {
                        width: col.width,
                        align: 'center',
                    });
                    x += col.width + columnSpacing;
                });

                y += headerHeight;
                doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
                y += 5;
                doc.font("Helvetica").fontSize(10);
            }

            // Fondo gris para filas impares
            if (index % 2 === 1) {
                doc.rect(startX, y, totalWidth, rowHeight).fill("#f2f2f2");
            }

            x = startX;
            columns.forEach(col => {
                let value = user[col.prop] ?? "";
                if (col.prop === "fecha_registro") {
                    const fecha = value ? new Date(value) : null;
                    value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
                }

                const text = value.toString();
                const textHeight = doc.heightOfString(text, { width: col.width });
                const verticalOffset = (rowHeight - textHeight) / 2;

                doc.fillColor("black").text(text, x, y + verticalOffset, {
                    width: col.width,
                    align: 'left'
                });
                x += col.width + columnSpacing;
            });

            y += rowHeight;
        });

        doc.end();

    } catch (error) {
        console.error("Error generando el PDF:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error al generar el PDF", error: error.message });
        }
    }
};

// Reporte de los Usuarios por Rol en PDF

export const getUsersByRolPDF = async (req, res) => {
    try {
        const users = await getAllUsers();
        const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_usuarios_rol.pdf");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        doc.pipe(res);

        doc.fontSize(20).text("Reporte de Usuarios por Rol", { align: "center" });
        doc.moveDown(2);

        const roles = {
            "1": "Administradores",
            "2": "Jefe de Mantenimiento",
            "3": "Líder Ambiental",
            "4": "Líder de Planta",
            "5": "Instructores"
        };

        const columns = [
            { label: "Tipo de Documento", prop: "nombre_documento", width: 70 },
            { label: "N° de Documento", prop: "numero_documento", width: 70 },
            { label: "Nombre", prop: "nombre", width: 70 },
            { label: "Apellido", prop: "apellido", width: 70 },
            { label: "Email", prop: "email", width: 105 },
            { label: "Teléfono", prop: "telefono", width: 70 },
            { label: "Dirección", prop: "direccion", width: 100 },
            { label: "Fecha de Registro", prop: "fecha_registro", width: 70 },
        ];

        const columnSpacing = 5;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * columnSpacing;
        const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
        let y = doc.y;

        const rowSpacing = 5;

        Object.keys(roles).forEach((rolKey, rolIndex) => {
            const groupUsers = users.filter(user => user.rol == rolKey);
            if (groupUsers.length === 0) return;

            if (rolIndex > 0) {
                doc.addPage(); // Nueva página por rol
                y = doc.page.margins.top;
            }

            doc.font("Helvetica-Bold").fontSize(16).fillColor("black").text(roles[rolKey], { align: "center" });
            y = doc.y + 10;

            // Encabezados
            doc.font("Helvetica-Bold").fontSize(11.5);
            const headerHeight = Math.max(...columns.map(col =>
                doc.heightOfString(col.label, { width: col.width, align: "center" })
            )) + rowSpacing;

            doc.rect(startX, y, totalWidth, headerHeight)
                .fillAndStroke("#eeeeee", "#000000");

            let x = startX;
            columns.forEach(col => {
                const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
                const verticalOffset = (headerHeight - labelHeight) / 2;

                doc.fillColor("black").text(col.label, x, y + verticalOffset, {
                    width: col.width,
                    align: 'center',
                });
                x += col.width + columnSpacing;
            });

            y += headerHeight;
            doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
            y += 5;

            doc.font("Helvetica").fontSize(10);

            groupUsers.forEach((user, index) => {
                let x = startX;

                const rowHeights = columns.map(col => {
                    let value = user[col.prop] ?? "";
                    if (col.prop === "fecha_registro") {
                        const fecha = value ? new Date(value) : null;
                        value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
                    }
                    return doc.heightOfString(value.toString(), {
                        width: col.width,
                        align: "left"
                    });
                });

                const rowHeight = Math.max(...rowHeights) + rowSpacing;

                if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                    doc.addPage();
                    y = doc.page.margins.top;

                    // Redibujar encabezado
                    doc.font("Helvetica-Bold").fontSize(11.5);
                    doc.rect(startX, y, totalWidth, headerHeight)
                        .fillAndStroke("#eeeeee", "#000000");

                    x = startX;
                    columns.forEach(col => {
                        const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
                        const verticalOffset = (headerHeight - labelHeight) / 2;

                        doc.fillColor("black").text(col.label, x, y + verticalOffset, {
                            width: col.width,
                            align: 'center',
                        });
                        x += col.width + columnSpacing;
                    });

                    y += headerHeight;
                    doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
                    y += 5;
                    doc.font("Helvetica").fontSize(10);
                }

                if (index % 2 === 1) {
                    doc.rect(startX, y, totalWidth, rowHeight).fill("#f2f2f2");
                }

                x = startX;
                columns.forEach(col => {
                    let value = user[col.prop] ?? "";
                    if (col.prop === "fecha_registro") {
                        const fecha = value ? new Date(value) : null;
                        value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
                    }

                    const text = value.toString();
                    const textHeight = doc.heightOfString(text, { width: col.width });
                    const verticalOffset = (rowHeight - textHeight) / 2;

                    doc.fillColor("black").text(text, x, y + verticalOffset, {
                        width: col.width,
                        align: 'left'
                    });
                    x += col.width + columnSpacing;
                });

                y += rowHeight;
            });

            y += 20;
        });

        doc.end();
    } catch (error) {
        console.error("Error generando el PDF por roles:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error al generar el PDF", error: error.message });
        }
    }
};

// Reporte de los Ambientes en Excel

export const getAmbientesPDF = async (req, res) => {
    try {
        const ambientes = await getAllAmbientes();
        const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_ambientes.pdf");

        doc.pipe(res);

        // Título centrado
        doc.fontSize(20).text("Reporte de Ambientes", { align: "center" });
        doc.moveDown();

        const columns = [
            { label: "Ambiente", prop: "numero_ambiente", width: 60 },
            { label: "Nombre del Ambiente", prop: "nombre_ambiente", width: 90 },
            { label: "Tipo de Ambiente", prop: "nombre_tipo_ambiente", width: 80 },
            { label: "Ubicación", prop: "ubicacion", width: 100 },
            { label: "Capacidad", prop: "capacidad", width: 60 },
            { label: "Estado", prop: "nombre_estado", width: 70 },
            { label: "Fecha Registro", prop: "fecha_registro", width: 80 },
            { label: "Imagen", prop: "imagen", width: 100 },
        ];

        const columnSpacing = 5;
        const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * columnSpacing;
        const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
        let y = doc.y + 10;
        const rowSpacing = 5;

        // Encabezado
        doc.font("Helvetica-Bold").fontSize(11.5);
        const headerHeight = Math.max(...columns.map(col =>
            doc.heightOfString(col.label, { width: col.width, align: "center" })
        )) + rowSpacing;

        doc.rect(startX, y, totalWidth, headerHeight).fillAndStroke("#eeeeee", "#000000");

        let x = startX;
        columns.forEach(col => {
            const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
            const verticalOffset = (headerHeight - labelHeight) / 2;

            doc.fillColor("black").text(col.label, x, y + verticalOffset, {
                width: col.width,
                align: "center",
            });

            x += col.width + columnSpacing;
        });

        y += headerHeight;
        doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
        y += 5;
        doc.font("Helvetica").fontSize(10);

        // Filas
        for (let i = 0; i < ambientes.length; i++) {
            const ambiente = ambientes[i];
            x = startX;

            const rowHeight = 60;

            if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;

                // Redibujar encabezado
                doc.font("Helvetica-Bold").fontSize(11.5);
                doc.rect(startX, y, totalWidth, headerHeight).fillAndStroke("#eeeeee", "#000000");

                x = startX;
                columns.forEach(col => {
                    const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
                    const verticalOffset = (headerHeight - labelHeight) / 2;

                    doc.fillColor("black").text(col.label, x, y + verticalOffset, {
                        width: col.width,
                        align: "center",
                    });

                    x += col.width + columnSpacing;
                });

                y += headerHeight;
                doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
                y += 5;
                doc.font("Helvetica").fontSize(10);
            }

            // Zebra style
            if (i % 2 === 1) {
                doc.rect(startX, y, totalWidth, rowHeight).fill("#f2f2f2");
            }

            x = startX;
            for (const col of columns) {
                let value = ambiente[col.prop];

                if (col.prop === "fecha_registro") {
                    const fecha = value ? new Date(value) : null;
                    value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
                }

                if (col.prop === "imagen") {
                    const fileName = path.basename(value ?? "");
                    const imagePath = path.resolve("src/uploads", fileName);

                    if (value && fs.existsSync(imagePath)) {
                        doc.image(imagePath, x + 10, y + 5, {
                            fit: [col.width - 20, rowHeight - 10],
                            align: "center",
                            valign: "center"
                        });
                    } else {
                        doc.fillColor("black").text("Sin imagen", x, y + rowHeight / 2 - 6, {
                            width: col.width,
                            align: "center"
                        });
                    }
                } else {
                    doc.fillColor("black").text(value?.toString() ?? "", x + 2, y + rowHeight / 2 - 6, {
                        width: col.width,
                        align: "left"
                    });
                }

                x += col.width + columnSpacing;
            }

            y += rowHeight;
        }

        doc.end();
    } catch (error) {
        console.error("Error generando el PDF de ambientes:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error al generar el PDF", error: error.message });
        }
    }
};

// Reporte de las Máquinas en PDF

export const getMaquinasPDF = async (req, res) => {
  try {
    const maquinas = await getAllMaquinas();
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_maquinas.pdf");
    doc.pipe(res);

    // Título
    doc.fontSize(20).text("Reporte de Máquinas", { align: "center" });
    doc.moveDown();

    const columns = [
      { label: "Imagen", prop: "imagen", width: 75 },
      { label: "Serie", prop: "serie", width: 60 },
      { label: "Marca", prop: "marca", width: 60 },
      { label: "Nombre", prop: "nombre", width: 60 },
      { label: "Ambiente", prop: "ambiente_numero", width: 60 },
      { label: "Descripción", prop: "descripcion", width: 80 },
      { label: "Estado", prop: "estado_nombre", width: 55 },
      { label: "Fecha de Adquisición", prop: "fecha_adquisicion", width: 75 },
      { label: "Cuentadante", prop: "cuentadante", width: 95 },
      { label: "Observaciones", prop: "observaciones", width: 90 },
    ];

    const columnSpacing = 5;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * columnSpacing;
    const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
    let y = doc.y + 10;
    const rowHeight = 70;

    // Encabezado
    doc.font("Helvetica-Bold").fontSize(11.5);
    const headerHeight = Math.max(...columns.map(col =>
      doc.heightOfString(col.label, { width: col.width, align: "center" })
    )) + 5;

    const drawHeader = () => {
      let x = startX;
      doc.rect(startX, y, totalWidth, headerHeight).fillAndStroke("#eeeeee", "#000000");
      columns.forEach(col => {
        const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
        const verticalOffset = (headerHeight - labelHeight) / 2;
        doc.fillColor("black").text(col.label, x, y + verticalOffset, {
          width: col.width,
          align: "center",
        });
        x += col.width + columnSpacing;
      });
      y += headerHeight;
      doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
      y += 5;
    };

    drawHeader();
    doc.font("Helvetica").fontSize(9);

    // Filas
    for (let i = 0; i < maquinas.length; i++) {
      const maquina = maquinas[i];
      let x = startX;

      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
        doc.font("Helvetica").fontSize(9);
      }

      if (i % 2 === 1) {
        doc.rect(startX, y, totalWidth, rowHeight).fill("#f2f2f2");
      }

      x = startX;
      for (const col of columns) {
        let value = maquina[col.prop];

        if (col.prop === "fecha_adquisicion") {
          const fecha = value ? new Date(value) : null;
          value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
        }

        if (col.prop === "cuentadante") {
          if (!maquina.cedula && !maquina.cuentadante && !maquina.email) {
            value = "No hay información del responsable disponible";
          } else {
            value = `Cédula: ${maquina.cedula || "N/A"}\nNombre: ${maquina.cuentadante || "N/A"}\nEmail: ${maquina.email || "N/A"}`;
          }
        }

        if (col.prop === "descripcion" && (!value || value.trim() === "")) {
          value = "No hay descripción disponible";
        }

        if (col.prop === "observaciones" && (!value || value.trim() === "")) {
          value = "No hay observaciones disponibles";
        }

        if (col.prop === "imagen") {
          const fileName = path.basename(value ?? "");
          const imagePath = path.resolve("src/uploads", fileName);

          if (value && fs.existsSync(imagePath)) {
            doc.image(imagePath, x + 10, y + 5, {
              fit: [col.width - 20, rowHeight - 10],
              align: "center",
              valign: "center",
            });
          } else {
            doc.fillColor("black").text("Sin imagen", x, y + (rowHeight / 2 - 6), {
              width: col.width,
              align: "center",
            });
          }
        } else {
          const textHeight = doc.heightOfString(value?.toString() ?? "N/A", {
            width: col.width - 4,
            align: "left",
          });
          const verticalOffset = (rowHeight - textHeight) / 2;

          doc.fillColor("black").text(value?.toString() ?? "N/A", x + 2, y + verticalOffset, {
            width: col.width - 4,
            align: "left",
          });
        }

        x += col.width + columnSpacing;
      }

      y += rowHeight;
    }

    doc.end();
  } catch (error) {
    console.error("Error generando el PDF de máquinas:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al generar el PDF", error: error.message });
    }
  }
};

// Reporte de los Mantenimientos de las Máquinas en PDF

export const getMantenimientosMaquinasPDF = async (req, res) => {
  try {
    const mantenimientos = await getAllMantenimientosMaquinas();
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_mantenimientos.pdf");
    doc.pipe(res);

    // Título
    doc.fontSize(20).text("Reporte de Mantenimientos de las Máquinas", { align: "center" });
    doc.moveDown();

    const columns = [
      { label: "Imagen", prop: "imagen", width: 75 },
      { label: "Serie Máquina", prop: "serie_maquina", width: 60 },
      { label: "Nombre Máquina", prop: "nombre_maquina", width: 70 },
      { label: "Fecha Programada", prop: "fecha_programada", width: 75 },
      { label: "Responsable", prop: "responsable", width: 110 },
      { label: "Tipo Mantenimiento", prop: "tipo_mantenimiento", width: 80 },
      { label: "Estado", prop: "estado", width: 55 },
      { label: "Descripción", prop: "descripcion", width: 90 },
      { label: "Fecha Registro", prop: "fecha_registro", width: 75 },
    ];

    const columnSpacing = 5;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * columnSpacing;
    const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
    let y = doc.y + 10;
    const rowHeight = 70;

    // Encabezado
    doc.font("Helvetica-Bold").fontSize(11.5);
    const headerHeight = Math.max(...columns.map(col =>
      doc.heightOfString(col.label, { width: col.width, align: "center" })
    )) + 5;

    const drawHeader = () => {
      let x = startX;
      doc.rect(startX, y, totalWidth, headerHeight).fillAndStroke("#eeeeee", "#000000");
      columns.forEach(col => {
        const labelHeight = doc.heightOfString(col.label, { width: col.width, align: "center" });
        const verticalOffset = (headerHeight - labelHeight) / 2;
        doc.fillColor("black").text(col.label, x, y + verticalOffset, {
          width: col.width,
          align: "center",
        });
        x += col.width + columnSpacing;
      });
      y += headerHeight;
      doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
      y += 5;
    };

    drawHeader();
    doc.font("Helvetica").fontSize(9);

    for (let i = 0; i < mantenimientos.length; i++) {
      const item = mantenimientos[i];
      let x = startX;

      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
        drawHeader();
        doc.font("Helvetica").fontSize(9);
      }

      if (i % 2 === 1) {
        doc.rect(startX, y, totalWidth, rowHeight).fill("#f2f2f2");
      }

      x = startX;

      for (const col of columns) {
        let value = item[col.prop];

        if (col.prop === "fecha_programada" || col.prop === "fecha_registro") {
          const fecha = value ? new Date(value) : null;
          value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
        }

        if (col.prop === "responsable") {
          const nombre = item.responsable;
          const email = item.email;

          if (!nombre && !email) {
            value = "No hay información del responsable disponible";
          } else {
            value = `Nombre: ${nombre ?? "N/A"}\nEmail: ${email ?? "N/A"}`;
          }
        }

        if (col.prop === "descripcion") {
          value = (value && value.trim() !== "") ? value : "No hay descripción disponible";
        }

        if (col.prop === "imagen") {
          const fileName = path.basename(value ?? "");
          const imagePath = path.resolve("src/uploads", fileName);

          if (value && fs.existsSync(imagePath)) {
            doc.image(imagePath, x + 10, y + 5, {
              fit: [col.width - 20, rowHeight - 10],
              align: "center",
              valign: "center",
            });
          } else {
            doc.fillColor("black").text("Sin imagen", x, y + (rowHeight / 2 - 6), {
              width: col.width,
              align: "center",
            });
          }
        } else {
          const textHeight = doc.heightOfString(value?.toString() ?? "N/A", {
            width: col.width - 4,
            align: "left",
          });
          const verticalOffset = (rowHeight - textHeight) / 2;

          doc.fillColor("black").text(value?.toString() ?? "N/A", x + 2, y + verticalOffset, {
            width: col.width - 4,
            align: "left",
          });
        }

        x += col.width + columnSpacing;
      }

      y += rowHeight;
    }

    doc.end();
  } catch (error) {
    console.error("Error generando el PDF de mantenimientos:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error al generar el PDF", error: error.message });
    }
  }
};

// Reporte de los Mantenimientos de los Ambientes en PDF

export const getMantenimientosAmbientesPDF = async (req, res) => {
    try {
      const mantenimientos = await getAllMantenimientosAmbientes();
      const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 40 });
  
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=reporte_mantenimientos_ambientes.pdf");
      doc.pipe(res);
  
      // Título
      doc.fontSize(18).text("Reporte de Mantenimientos de Ambientes", { align: "center" });
      doc.moveDown(1.5);
  
      const columns = [
        { label: "Imagen", prop: "imagen", width: 80 },
        { label: "Ambiente", prop: "numero_ambiente", width: 70 },
        { label: "Fecha Programada", prop: "fecha_programada", width: 100 },
        { label: "Descripción", prop: "descripcion", width: 150 },
        { label: "Fecha Registro", prop: "fecha_registro", width: 100 },
      ];
  
      const spacing = 5;
      const totalWidth = columns.reduce((sum, col) => sum + col.width, 0) + (columns.length - 1) * spacing;
      const startX = doc.page.margins.left + (doc.page.width - doc.page.margins.left - doc.page.margins.right - totalWidth) / 2;
      let y = doc.y;
      const rowHeight = 60;
  
      // Encabezado
      const drawHeader = () => {
        let x = startX;
        doc.font("Helvetica-Bold").fontSize(10);
        const headerHeight = 25;
  
        doc.rect(startX, y, totalWidth, headerHeight).fillAndStroke("#eeeeee", "#000");
        columns.forEach(col => {
          doc.fillColor("black").text(col.label, x, y + 7, {
            width: col.width,
            align: "center",
          });
          x += col.width + spacing;
        });
  
        y += headerHeight + 5;
      };
  
      drawHeader();
      doc.font("Helvetica").fontSize(9);
  
      for (let i = 0; i < mantenimientos.length; i++) {
        const item = mantenimientos[i];
        let x = startX;
  
        if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
          doc.addPage();
          y = doc.page.margins.top;
          drawHeader();
          doc.font("Helvetica").fontSize(9);
        }
  
        if (i % 2 === 1) {
          doc.rect(startX, y, totalWidth, rowHeight).fill("#f9f9f9");
        }
  
        x = startX;
  
        for (const col of columns) {
          let value = item[col.prop];
  
          if (col.prop === "fecha_programada" || col.prop === "fecha_registro") {
            const fecha = value ? new Date(value) : null;
            value = fecha ? fecha.toISOString().split("T")[0] : "N/A";
          }
  
          if (col.prop === "descripcion") {
            value = value?.trim() ? value : "Sin descripción";
          }
  
          if (col.prop === "imagen") {
            const fileName = path.basename(value ?? "");
            const imagePath = path.resolve("src/uploads", fileName);
  
            if (value && fs.existsSync(imagePath)) {
              doc.image(imagePath, x + 10, y + 5, {
                fit: [col.width - 20, rowHeight - 10],
                align: "center",
                valign: "center",
              });
            } else {
              doc.fillColor("black").text("Sin imagen", x, y + (rowHeight / 2 - 6), {
                width: col.width,
                align: "center",
              });
            }
          } else {
            const textHeight = doc.heightOfString(value?.toString() ?? "N/A", {
              width: col.width - 4,
              align: "left",
            });
            const verticalOffset = (rowHeight - textHeight) / 2;
  
            doc.fillColor("black").text(value?.toString() ?? "N/A", x + 2, y + verticalOffset, {
              width: col.width - 4,
              align: "left",
            });
          }
  
          x += col.width + spacing;
        }
  
        y += rowHeight;
      }
  
      doc.end();
    } catch (error) {
      console.error("Error generando el PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el PDF", error: error.message });
      }
    }
  };