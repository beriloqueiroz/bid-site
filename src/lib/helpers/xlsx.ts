import xlsx from 'xlsx';

export async function xlsxToJson(path:string, sheetName:string) {
  const workbook = xlsx.readFile(path);
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json(sheet);
  return json;
}
