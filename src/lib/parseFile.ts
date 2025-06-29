import Papa from 'papaparse';
import ExcelJS from 'exceljs';

// CSV Parser
export const parseCSVFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as any[]),
      error: (err) => reject(err),
    });
  });
};

// XLSX Parser using exceljs
export const parseXLSXFile = async (file: File): Promise<any[]> => {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = await file.arrayBuffer();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0]; // Use first sheet
  const rows: any[] = [];

  let headers: string[] = [];

  worksheet.eachRow((row, rowIndex) => {
    const values = row.values as string[];

    if (rowIndex === 1) {
      // First row = headers
      headers = values.slice(1); // remove empty first item
    } else {
      const obj: Record<string, any> = {};
      values.slice(1).forEach((val, i) => {
        obj[headers[i]] = val;
      });
      rows.push(obj);
    }
  });

  return rows;
};

// Auto-detect file type
export const parseFile = async (file: File): Promise<any[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'csv') {
    return await parseCSVFile(file);
  } else if (extension === 'xlsx') {
    return await parseXLSXFile(file);
  } else {
    throw new Error('Unsupported file type');
  }
};
