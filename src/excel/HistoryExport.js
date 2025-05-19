import DateFormatToIDN from '../helper/DateFormatToIDN';
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

const HistoryExport = async(history) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Tabel History Barang');

            sheet.columns = [
                { header: 'No', width: 15 },
                { header: 'ID', width: 10 },
                { header: 'Asset Kode', width: 15 },
                { header: 'Unit Device', width: 20 },
                { header: 'Spek Origin', width: 20 },
                { header: 'Spek Upgraded', width: 20 },
                { header: 'Tanggal History', width: 15 },
                { header: 'Lokasi', width: 20 },
                { header: 'User', width: 15 },
                { header: 'Status', width: 10 },
            ];

            let index = 0
            const existingIds = new Set()
            for (const h of history) {
                let rowIndex = ' ';
                let rowAsset = ' '
                let rowUnit = ' '
                let rowId = ' '
                let rowOrigin = ' '
                if (!existingIds.has(h.barang_id)) {
                    existingIds.add(h.barang_id)
                    index++
                    rowIndex = index
                    rowAsset = h.barang.asset_kode
                    rowUnit = h.barang.unit_device
                    rowId = h.barang.id
                    rowOrigin = h.barang.spek_origin
                }
                
                const row = sheet.addRow([
                    rowIndex || '',
                    rowId,
                    rowAsset,
                    rowUnit,
                    rowOrigin,
                    h.spek_upgraded || '',
                    DateFormatToIDN(h.created_at.split('T')[0]) || '',
                    h.lokasi || '',
                    h.username,
                    h.status,
                ]);
    
                sheet.getRow(row.number).eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'center' };
                })
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
            createOuterBorder(sheet, { row: 1, col: 1 }, { row: history.length + 1, col: 10 });

            
    
            // Save the Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'Data_History.xlsx');
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Excel',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
}

export default HistoryExport