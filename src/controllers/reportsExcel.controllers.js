import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
import { getAllUsers } from "../models/user.models.js"
import { getAllAmbientes } from "../models/ambientes.models.js";
import { getAllMaquinas } from "../models/maquinas.models.js";
import { getAllMantenimientosMaquinas } from "../models/mantenimientos_maquinas.models.js";
import { getAllMantenimientosAmbientes } from "../models/mantenimientos_ambientes.models.js";

// Reporte de los Usuarios en Excel

export const getUsersExcel = async (req, res) => {
    try {
      const users = await getAllUsers();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Usuarios");
  
      // 1. TÍTULO
      worksheet.mergeCells("A1", "J1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Usuarios";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // 2. ENCABEZADOS
      const headers = [
        "Tipo de Documento",
        "Número de Documento",
        "Nombre",
        "Apellido",
        "Email",
        "Teléfono",
        "Dirección",
        "Rol",
        "Fecha de Registro",
      ];
  
      worksheet.columns = [
        { key: "nombre_documento", width: 20 },
        { key: "numero_documento", width: 20 },
        { key: "nombre", width: 20 },
        { key: "apellido", width: 20 },
        { key: "email", width: 30 },
        { key: "telefono", width: 20 },
        { key: "direccion", width: 25 },
        { key: "nombre_rol", width: 20 },
        { key: "fecha_registro", width: 20 },
      ];
  
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 20;
  
      headerRow.eachCell(cell => {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00af00" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
  
      // 3. FILAS DE DATOS
      users.forEach((user, index) => {
        const row = worksheet.addRow([
          user.nombre_documento || "No hay información disponible",
          user.numero_documento || "No hay información disponible",
          user.nombre || "No hay información disponible",
          user.apellido || "No hay información disponible",
          user.email || "No hay información disponible",
          user.telefono || "No hay información disponible",
          user.direccion || "No hay información disponible",
          user.nombre_rol || "No hay información disponible",
          user.fecha_registro
            ? new Date(user.fecha_registro).toISOString().split("T")[0]
            : "No hay información disponible",
        ]);
  
        // Estilo de fila
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.font = { size: 12 };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        });
      });
  
      // 4. Enviar archivo
      const buffer = await workbook.xlsx.writeBuffer();
  
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_usuarios.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
  
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel de usuarios:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};

// Reporte de los Usuarios por Rol en Excel

export const getUsersByRolExcel = async (req, res) => {
    try {
      const users = await getAllUsers();
  
      const roles = {
        "1": "Administradores",
        "2": "Jefe de Mantenimiento",
        "3": "Líder Ambiental",
        "4": "Líder de Planta",
        "5": "Instructores",
      };
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Usuarios por Rol");
  
      // 1. TÍTULO
      worksheet.mergeCells("A1", "I1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Usuarios por Rol";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // Columnas (sin encabezado global porque se repetirán por cada rol)
      const columns = [
        { key: "tipo_documento", width: 20 },
        { key: "numero_documento", width: 20 },
        { key: "nombre", width: 20 },
        { key: "apellido", width: 20 },
        { key: "email", width: 30 },
        { key: "telefono", width: 15 },
        { key: "direccion", width: 30 },
        { key: "rol", width: 20 },
        { key: "fecha_ingreso", width: 20 },
      ];
      worksheet.columns = columns;
  
      // 2. Iteramos por cada rol
      Object.keys(roles).forEach((roleKey) => {
        const usersByRole = users.filter((u) => u.rol == roleKey);
  
        if (usersByRole.length > 0) {
          // Encabezado del rol
          const rolTitleRow = worksheet.addRow([]);
            const lastColLetter = worksheet.getColumn(columns.length).letter;
            const mergeRange = `A${rolTitleRow.number}:${lastColLetter}${rolTitleRow.number}`;
            worksheet.mergeCells(mergeRange);

            const mergedCell = rolTitleRow.getCell(1);
            mergedCell.value = roles[roleKey];
            mergedCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
            mergedCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF008000" },
            };
            mergedCell.alignment = { horizontal: "center", vertical: "middle" };

            // Fila vacía después del título
            worksheet.addRow([]);
  
          // Encabezados
          const headerRow = worksheet.addRow([
            "Tipo de Documento",
            "Número de Documento",
            "Nombre",
            "Apellido",
            "Email",
            "Teléfono",
            "Dirección",
            "Rol",
            "Fecha de Registro",
          ]);
          headerRow.height = 20;
  
          headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "00af00" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          });
  
          // Filas de usuarios
          usersByRole.forEach((user, index) => {
            const row = worksheet.addRow([
              user.nombre_documento || "No hay información disponible",
              user.numero_documento || "No hay información disponible",
              user.nombre || "No hay información disponible",
              user.apellido || "No hay información disponible",
              user.email || "No hay información disponible",
              user.telefono || "No hay información disponible",
              user.direccion || "No hay información disponible",
              roles[roleKey],
              user.fecha_registro
                ? new Date(user.fecha_registro).toISOString().split("T")[0]
                : "No hay información disponible",
            ]);
  
            row.eachCell((cell) => {
              cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
              cell.font = { size: 12 };
              cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
              };
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFF" },
              };
            });
          });
  
          worksheet.addRow([]);
        }
      });
  
      // 3. Enviar archivo
      const buffer = await workbook.xlsx.writeBuffer();
  
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_usuarios_roles.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
  
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel por roles:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};

// Reporte de los Ambientes en Excel

export const getAmbientesExcel = async (req, res) => {
    try {
      const ambientes = await getAllAmbientes();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Ambientes");
  
      // 1. TÍTULO PRINCIPAL
      worksheet.mergeCells("A1", "H1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Ambientes";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // 2. ENCABEZADOS
      worksheet.columns = [
        { key: "imagen", width: 20 },
        { key: "numero_ambiente", width: 15 },
        { key: "nombre_ambiente", width: 20 },
        { key: "nombre_tipo_ambiente", width: 25 },
        { key: "ubicacion", width: 20 },
        { key: "capacidad", width: 15 },
        { key: "nombre_estado", width: 15 },
        { key: "fecha_registro", width: 20 },
      ];
  
      const headerValues = [
        "Imagen",
        "Ambiente",
        "Nombre del Ambiente",
        "Tipo de Ambiente",
        "Ubicación",
        "Capacidad",
        "Estado",
        "Fecha de Registro",
      ];
      const headerRow = worksheet.addRow(headerValues);
  
      // Estilo de los encabezados (solo columnas 1 a 8)
      for (let i = 1; i <= 8; i++) {
        const cell = headerRow.getCell(i);
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00af00" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      headerRow.height = 20;
  
      // 3. FILAS DE DATOS
      let rowIndex = 4;
      const imageColumnIndex = 1;
      const imageSize = { width: 80, height: 60 };
  
      for (const ambiente of ambientes) {
        const row = worksheet.addRow([
          "", // Imagen (se agregará luego)
          ambiente.numero_ambiente,
          ambiente.nombre_ambiente,
          ambiente.nombre_tipo_ambiente,
          ambiente.ubicacion,
          ambiente.capacidad,
          ambiente.nombre_estado,
          ambiente.fecha_registro ? new Date(ambiente.fecha_registro).toISOString().split("T")[0] : "N/A",
        ]);
  
        worksheet.getRow(rowIndex).height = 55;
  
        // Cargar imagen si existe
        if (ambiente.imagen) {
          const fileName = path.basename(ambiente.imagen);
          const imagePath = path.resolve("src/uploads", fileName);
          if (fs.existsSync(imagePath)) {
            const imageId = workbook.addImage({
              filename: imagePath,
              extension: fileName.split(".").pop(),
            });
  
            // Centrado visual leve en celda
            worksheet.addImage(imageId, {
              tl: { col: imageColumnIndex - 1 + 0.2, row: rowIndex - 1 + 0.2 },
              ext: { width: imageSize.width, height: imageSize.height },
              editAs: "oneCell",
            });
          } else {
            row.getCell(imageColumnIndex).value = "Sin imagen";
          }
        } else {
          row.getCell(imageColumnIndex).value = "Sin imagen";
        }
  
        // Estilo de celdas
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" }, // fondo blanco
          };
        });
  
        rowIndex++;
      }
  
      // 4. Enviar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_ambientes.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};

// Reporte de las Máquinas en Excel

export const getMaquinasExcel = async (req, res) => {
    try {
      const maquinas = await getAllMaquinas();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Máquinas");
  
      // 1. TÍTULO PRINCIPAL
      worksheet.mergeCells("A1", "M1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de Máquinas";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // 2. ENCABEZADOS
      worksheet.columns = [
        { key: "imagen", width: 20 },
        { key: "serie", width: 20 },
        { key: "marca", width: 15 },
        { key: "nombre", width: 20 },
        { key: "ambiente_numero", width: 20 },
        { key: "descripcion", width: 25 },
        { key: "estado_nombre", width: 15 },
        { key: "fecha_adquisicion", width: 18 },
        { key: "cedula", width: 15 },
        { key: "cuentadante", width: 20 },
        { key: "email", width: 25 },
        { key: "observaciones", width: 25 },
        { key: "fecha_registro", width: 18 },
      ];
  
      const headerValues = [
        "Imagen",
        "Serie",
        "Marca",
        "Nombre",
        "Ambiente",
        "Descripción",
        "Estado",
        "Fecha de Adquisición",
        "Cédula",
        "Cuentadante",
        "Email",
        "Observaciones",
        "Fecha de Registro",
      ];
      const headerRow = worksheet.addRow(headerValues);
  
      for (let i = 1; i <= 13; i++) {
        const cell = headerRow.getCell(i);
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00af00" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      headerRow.height = 20;
  
      // 3. FILAS DE DATOS
      let rowIndex = 4;
      const imageColumnIndex = 1;
      const imageSize = { width: 80, height: 60 };
  
      for (const maquina of maquinas) {
        const row = worksheet.addRow([
          "", // Imagen
          maquina.serie || "No hay información disponible",
          maquina.marca || "No hay información disponible",
          maquina.nombre || "No hay información disponible",
          maquina.ambiente_numero || "No hay información disponible",
          maquina.descripcion?.trim() || "Sin descripción",
          maquina.estado_nombre || "No hay información disponible",
          maquina.fecha_adquisicion
            ? new Date(maquina.fecha_adquisicion).toISOString().split("T")[0]
            : "No hay información disponible",
          maquina.cedula || "No hay información disponible",
          maquina.cuentadante || "No hay información disponible",
          maquina.email || "No hay información disponible",
          maquina.observaciones?.trim() || "Sin observaciones",
          maquina.fecha_registro
            ? new Date(maquina.fecha_registro).toISOString().split("T")[0]
            : "No hay información disponible",
        ]);
  
        worksheet.getRow(rowIndex).height = 55;
  
        // Cargar imagen si existe
        if (maquina.imagen) {
          const fileName = path.basename(maquina.imagen);
          const imagePath = path.resolve("src/uploads", fileName);
          if (fs.existsSync(imagePath)) {
            const imageId = workbook.addImage({
              filename: imagePath,
              extension: fileName.split(".").pop(),
            });
  
            worksheet.addImage(imageId, {
              tl: { col: imageColumnIndex - 1 + 0.2, row: rowIndex - 1 + 0.2 },
              ext: { width: imageSize.width, height: imageSize.height },
              editAs: "oneCell",
            });
          } else {
            row.getCell(imageColumnIndex).value = "Sin imagen";
          }
        } else {
          row.getCell(imageColumnIndex).value = "Sin imagen";
        }
  
        // Estilo de celdas
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.font = { size: 12 };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        });
  
        rowIndex++;
      }
  
      // 4. Enviar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_maquinas.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel de máquinas:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};

// Reporte de los Mantenimientos de las Máquinas en Excel

export const getMantenimientosMaquinasExcel = async (req, res) => {
    try {
      const mantenimientos = await getAllMantenimientosMaquinas();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("MantenimientosMaquinas");
  
      // 1. TÍTULO
      worksheet.mergeCells("A1", "J1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de los Mantenimientos de las Máquinas";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // 2. ENCABEZADOS
      worksheet.columns = [
        { key: "imagen", width: 20 },
        { key: "serie_maquina", width: 20 },
        { key: "nombre_maquina", width: 20 },
        { key: "fecha_programada", width: 20 },
        { key: "responsable", width: 20 },
        { key: "email", width: 25 },
        { key: "tipo_mantenimiento", width: 20 },
        { key: "estado", width: 15 },
        { key: "descripcion", width: 30 },
        { key: "fecha_registro", width: 20 },
      ];
  
      const headerValues = [
        "Imagen",
        "Serie",
        "Nombre",
        "Fecha Programada",
        "Responsable",
        "Email",
        "Tipo de Mantenimiento",
        "Estado",
        "Descripción",
        "Fecha de Registro",
      ];
      const headerRow = worksheet.addRow(headerValues);
  
      for (let i = 1; i <= headerValues.length; i++) {
        const cell = headerRow.getCell(i);
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00af00" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      headerRow.height = 20;
  
      // 3. DATOS
      let rowIndex = 4;
      const imageColumnIndex = 1;
      const imageSize = { width: 80, height: 60 };
  
      for (const m of mantenimientos) {
        const row = worksheet.addRow([
          "", // Imagen
          m.serie_maquina || "No hay información disponible",
          m.nombre_maquina || "No hay información disponible",
          m.fecha_programada ? new Date(m.fecha_programada).toISOString().split("T")[0] : "No hay información disponible",
          m.responsable || "No hay información disponible",
          m.email || "No hay información disponible",
          m.tipo_mantenimiento || "No hay información disponible",
          m.estado || "No hay información disponible",
          m.descripcion || "Sin descripción",
          m.fecha_registro ? new Date(m.fecha_registro).toISOString().split("T")[0] : "No hay información disponible",
        ]);
  
        worksheet.getRow(rowIndex).height = 55;
  
        // Imagen
        if (m.imagen) {
          const fileName = path.basename(m.imagen);
          const imagePath = path.resolve("src/uploads", fileName);
          if (fs.existsSync(imagePath)) {
            const imageId = workbook.addImage({
              filename: imagePath,
              extension: fileName.split(".").pop(),
            });
            worksheet.addImage(imageId, {
              tl: { col: imageColumnIndex - 1 + 0.2, row: rowIndex - 1 + 0.2 },
              ext: imageSize,
              editAs: "oneCell",
            });
          } else {
            row.getCell(imageColumnIndex).value = "Sin imagen";
          }
        } else {
          row.getCell(imageColumnIndex).value = "Sin imagen";
        }
  
        // Estilo de las celdas
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.font = { size: 12 };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        });
  
        rowIndex++;
      }
  
      // 4. Enviar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_mantenimientos_maquinas.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel de mantenimientos:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};

// Reporte de los Mantenimientos de los Ambientes en Excel

export const getMantenimientosAmbientesExcel = async (req, res) => {
    try {
      const mantenimientos = await getAllMantenimientosAmbientes();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("MantenimientosAmbientes");
  
      // 1. TÍTULO
      worksheet.mergeCells("A1", "E1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Reporte de los Mantenimientos de los Ambientes";
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.font = { size: 14, bold: true, color: { argb: "FFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "008e00" },
      };
      worksheet.getRow(1).height = 30;
  
      // Fila vacía
      worksheet.addRow([]);
  
      // 2. ENCABEZADOS
      worksheet.columns = [
        { key: "imagen", width: 20 },
        { key: "numero_ambiente", width: 20 },
        { key: "fecha_programada", width: 20 },
        { key: "descripcion", width: 35 },
        { key: "fecha_registro", width: 20 },
      ];
  
      const headerValues = [
        "Imagen",
        "Ambiente",
        "Fecha Programada",
        "Descripción",
        "Fecha de Registro",
      ];
      const headerRow = worksheet.addRow(headerValues);
  
      for (let i = 1; i <= headerValues.length; i++) {
        const cell = headerRow.getCell(i);
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "00af00" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      }
      headerRow.height = 20;
  
      // 3. DATOS
      let rowIndex = 4;
      const imageColumnIndex = 1;
      const imageSize = { width: 80, height: 60 };
  
      for (const m of mantenimientos) {
        const row = worksheet.addRow([
          "", // Imagen
          m.numero_ambiente || "No hay información disponible",
          m.fecha_programada ? new Date(m.fecha_programada).toISOString().split("T")[0] : "No hay información disponible",
          m.descripcion || "Sin descripcion",
          m.fecha_registro ? new Date(m.fecha_registro).toISOString().split("T")[0] : "No hay información disponible",
        ]);
  
        worksheet.getRow(rowIndex).height = 55;
  
        // Imagen
        if (m.imagen) {
          const fileName = path.basename(m.imagen);
          const imagePath = path.resolve("src/uploads", fileName);
          if (fs.existsSync(imagePath)) {
            const imageId = workbook.addImage({
              filename: imagePath,
              extension: fileName.split(".").pop(),
            });
            worksheet.addImage(imageId, {
              tl: { col: imageColumnIndex - 1 + 0.2, row: rowIndex - 1 + 0.2 },
              ext: imageSize,
              editAs: "oneCell",
            });
          } else {
            row.getCell(imageColumnIndex).value = "Sin imagen";
          }
        } else {
          row.getCell(imageColumnIndex).value = "Sin imagen";
        }
  
        // Estilo de las celdas
        row.eachCell(cell => {
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.font = { size: 12 };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF" },
          };
        });
  
        rowIndex++;
      }
  
      // 4. Enviar archivo Excel
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader("Content-Disposition", 'attachment; filename="reporte_mantenimientos_ambientes.xlsx"');
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error generando el Excel de mantenimientos de ambientes:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error al generar el Excel", error: error.message });
      }
    }
};