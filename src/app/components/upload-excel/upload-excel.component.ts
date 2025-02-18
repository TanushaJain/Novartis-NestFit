import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-excel',
  standalone: true,
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.css'],
  imports: [CommonModule]
})
export class UploadExcelComponent {
  uploadedData: any[] = [];
  fileName: string = "";
  predictedResults: any[] = [];

  constructor(private http: HttpClient) {}

  // ✅ Function to get keys safely
  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        this.uploadedData = XLSX.utils.sheet_to_json(worksheet);
        console.log("Uploaded Data:", this.uploadedData);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  predict() {
    if (this.uploadedData.length === 0) {
      alert("Please upload an Excel file first!");
      return;
    }

    this.http.post<{ predictions: any[] }>('http://127.0.0.1:5000/batch-predict', this.uploadedData)
      .subscribe(response => {
        this.predictedResults = response.predictions;
        console.log("Predictions received:", this.predictedResults);
      }, error => {
        console.error("Error in prediction:", error);
      });
  }

  downloadResults() {
    if (this.predictedResults.length === 0) {
      alert("No predictions available for download.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(this.predictedResults);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Predictions");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "Predicted_Results.xlsx");
  }
}
