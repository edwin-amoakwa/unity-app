import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  constructor() { }

  public static removeIdFields(data: any[]): any[] {
    return data.map(item => {
      const cleanedItem: any = {};

      for (const key in item) {
        if (!(key === 'id' || key.endsWith('Id'))) {
          cleanedItem[key] = item[key];
        }
      }

      return cleanedItem;
    });
  }

  public static removeIdFieldsInPlace(data: any[]): void {
    data.forEach(item => {
      for (const key in item) {
        if (key === 'id' || key.endsWith('Id')) {
          delete item[key];
        }
      }
    });
  }

  public static exportAsExcelFile(json: any[], excelFileName: string): void
  {

    let finalExport:any[] = [];

    json.forEach(item => {
      let rec:any = {};
      Object.keys(item).forEach((objectKey) => {
        const keyAsTitleCase = objectKey.replace(/([A-Z])/g, " $1");
        const keyAsTitleCaseCapitalised = keyAsTitleCase.charAt(0).toUpperCase() + keyAsTitleCase.slice(1);
        rec[keyAsTitleCaseCapitalised] = item[objectKey];
      });
      finalExport.push(rec);
      // //console.log(rec);
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(finalExport);

    // console.table('worksheet',worksheet);

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }


  public static exportAsExcelFileSkipHeading(json: any[], excelFileName: string): void
  {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json,{ skipHeader: true });


    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private static saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }


  private static save(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
    });
    // data.b
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
