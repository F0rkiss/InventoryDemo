import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver';
import QRCode from 'qrcode'
import { encrypting } from '../helper/EncryptHelper';
import Swal from 'sweetalert2';

const createOuterBorder = (worksheet, start = {row: 1, col: 1}, end = {row: 1, col: 1}, borderWidth = 'thin') => {

    const borderStyle = {
        style: borderWidth
    };
    for (let i = start.row; i <= end.row; i++) {
        const leftBorderCell = worksheet.getCell(i, start.col);
        const rightBorderCell = worksheet.getCell(i, end.col);
        leftBorderCell.border = {
            ...leftBorderCell.border,
            left: borderStyle
        };
        rightBorderCell.border = {
            ...rightBorderCell.border,
            right: borderStyle
        };
    }

    for (let i = start.col; i <= end.col; i++) {
        const topBorderCell = worksheet.getCell(start.row, i);
        const bottomBorderCell = worksheet.getCell(end.row, i);
        topBorderCell.border = {
            ...topBorderCell.border,
            top: borderStyle
        };
        bottomBorderCell.border = {
            ...bottomBorderCell.border,
            bottom: borderStyle
        };
    }
};

const exportToExcel = async (statusSheets) => {
    try {
        const workbook = new ExcelJS.Workbook();
        for (const barangs in statusSheets) {
            const barang = statusSheets[barangs].barang
            const title = statusSheets[barangs].title
            const sheet = workbook.addWorksheet(`Tabel Barang ${title}`);

            sheet.columns = [
                { header: 'No', width: 15 },
                { header: 'Asset Kode', width: 15 },
                { header: 'Kode Unit', width: 10 },
                { header: 'Unit Tags', width: 20 },
                { header: 'Type Monitor', width: 15 },
                { header: 'User', width: 15 },
                { header: 'Status', width: 10 },
                { header: 'Spek', width: 20 },
                { header: 'Spek Upgraded', width: 20 },
                { header: 'Note', width: 25 },
                { header: 'QR', width: 15 },
                { header: 'Link', width: 125 }
            ];
    
            let index = 0
            for (const b of barang) {
                index++
                const encryptedIds = await encrypting(b.id)
                const qrCodeData = `${location.origin}/barang/detail-barang/${encryptedIds}`;
    
                const qrCodeImage = await QRCode.toDataURL(qrCodeData);
    
                const row = sheet.addRow([
                    index || '',
                    b.asset_kode,
                    b.asset_kode.slice(3, 8),
                    b.category.name,
                    b.type_monitor || '',
                    b.user?.name || '',
                    b.status,
                    b.spek_origin,
                    b.spek_akhir || '',
                    b.note,
                    '',
                    '',
                ]);
    
                sheet.getRow(row.number).height = 68;
    
                sheet.getRow(row.number).eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'center' };
                })
    
                const qrImage = workbook.addImage({
                    base64: qrCodeImage,
                    extension: 'png',
                });
    
                sheet.addImage(qrImage, {
                    tl: { col: 10.8, row: row.number - 1 + 0.1 },
                    ext: { width: 80, height: 80 },           
                    editAs: 'oneCell'                           
                });
    
                
                const linkCell = sheet.getCell(row.number, 12);
                linkCell.value = { text : qrCodeData, hyperlink : qrCodeData},
                linkCell.font = { color : {argb : 'FF0000FF'}, underline : true}
    
            }
    
            // Style the header row
            sheet.getRow(1).eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.alignment = { horizontal: 'center', vertical: 'center' };
                cell.font = { bold: true };
            });
    
    
            // Apply outer border to data range
            createOuterBorder(sheet, { row: 1, col: 1 }, { row: barang.length + 1, col: 12 });
    
        }
        // Save the Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Data_Barang.xlsx`);
    } catch (error) {
        Swal.fire({
            icon:'error',
            title:'Tidak Dapat Membuat Excel',
            text:'Ada Kesalahan Dalam Sistem'
        })
    }
};

export default exportToExcel
