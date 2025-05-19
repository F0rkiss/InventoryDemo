import DateFormatToIDN from '../helper/DateFormatToIDN';
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver';
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

const MRExport = async(make_request) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Tabel Make Request');

            sheet.columns = [
                { header: 'No', width: 5 },
                { header: 'Jenis Permintaan', width: 20 },
                { header: 'User', width: 15 },
                { header: 'Status', width: 10 },
                { header: 'Deskripsi', width: 20 },
                { header: 'Keperluan', width: 20 },
                { header: 'Note', width: 20 },
                { header: 'Tanggal Pembuatan', width: 20 },
                { header: 'Tanggal Penerimaan', width: 20 },
                { header: 'Tanggal Penyerahan', width: 20 },
                { header: 'Kode Penyerahan', width: 20 },
                { header: 'Barang', width: 50 },
            ];

            let index = 0
            const existingIds = new Set()
            for (const mr of make_request) {
                let rowIndex = '';
                if (!existingIds.has(mr.id)) {
                    existingIds.add(mr.id)
                    index++
                    rowIndex = index
                }

                const barangArray = mr.barangs.map((b) => (`${b.unit_device} - ${b.asset_kode}`).split(',')) 
                const withoutBracket = eval(barangArray).join(', ')

                const row = sheet.addRow([
                    rowIndex || ' ',
                    mr.jenis_permintaan,
                    mr.username,
                    mr.status,
                    mr.description || ' ',
                    mr.keperluan || ' ',
                    mr.note || ' ',
                    DateFormatToIDN(mr.created_at.split('T')[0]) || '',
                    mr.tanggal_penerimaan || ' ',
                    mr.tanggal_penyerahan || ' ',
                    mr.kode_penyerahan || ' ',
                    `${withoutBracket} ` || ' ',
                    
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
            createOuterBorder(sheet, { row: 1, col: 1 }, { row: make_request.length + 1, col: 12 });
    
            // Save the Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), 'Data_Make_Request.xlsx');
        } catch (error) {
            Swal.fire({
                icon:'error',
                title:'Tidak Dapat Membuat Excel',
                text:'Ada Kesalahan Dalam Sistem'
            })
        }
}

export default MRExport