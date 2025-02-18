import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';  // Import Bootstrap modal class
import 'bootstrap/dist/css/bootstrap.min.css';

@Component({
  selector: 'app-feature-form',
  standalone: true,
  templateUrl: './feature-form.component.html',
  styleUrls: ['./feature-form.component.css'],
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule
  ]
})
export class FeatureFormComponent {
  featureForm: FormGroup;
  predictionResult: string | null = null;
  showModal: boolean = false;  // Control modal visibility
  modal: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.featureForm = this.fb.group({
      enrollment: [''],
      studyDuration: [''],
      startDateYear: [''],
      startDateMonth: [''],
      completionDateYear: [''],
      completionDateMonth: [''],
      enrollmentMissing: [''],
      enrollmentScaled: [''],
      sex: [''],
      healthyVolunteers: [''],
      studyType: [''],
      funderType: ['']
    });
  }

  onSubmit() {
    const formData = this.featureForm.value;

    let formattedData: any = {
      "Enrollment": formData.enrollment ? Number(formData.enrollment) : 0,
      "Study Duration": formData.studyDuration ? Number(formData.studyDuration) : 0,
      "Start Date_Year": formData.startDateYear ? Number(formData.startDateYear) : null,
      "Start Date_Month": formData.startDateMonth ? Number(formData.startDateMonth) : null,
      "Completion Date_Year": formData.completionDateYear ? Number(formData.completionDateYear) : null,
      "Completion Date_Month": formData.completionDateMonth ? Number(formData.completionDateMonth) : null,
      "Enrollment_missing": formData.enrollmentMissing === "yes" ? 1 : 0,
      "Enrollment_Scaled": formData.enrollmentScaled ? Number(formData.enrollmentScaled) : 0,
      "Sex_ALL": formData.sex === "all" ? 1 : 0,
      "Sex_FEMALE": formData.sex === "female" ? 1 : 0,
      "Sex_MALE": formData.sex === "male" ? 1 : 0,
      "StudyType_INTERVENTIONAL": formData.studyType === "interventional" ? 1 : 0,
      "StudyType_OBSERVATIONAL": formData.studyType === "observational" ? 1 : 0,
      "FunderType_INDIV": formData.funderType === "individual" ? 1 : 0,
      "FunderType_INDUSTRY": formData.funderType === "industry" ? 1 : 0,
      "FunderType_NIH": formData.funderType === "nih" ? 1 : 0,
      "FunderType_OTHER": formData.funderType === "other" ? 1 : 0,
      "healthy_volunteers": formData.healthyVolunteers === "yes" ? 1 : 0,
    };

    this.http.post<{ prediction: number }>('http://127.0.0.1:5000/predict', formattedData)
      .subscribe(response => {
        if (response.prediction === 1) {
          this.predictionResult = "The study is expected to be completed.";
        } else {
          this.predictionResult = "The study is not expected to be completed.";
        }
        const modalElement = document.getElementById('resultModal');
  this.modal = new Modal(modalElement!);
        this.modal.show();  // Show the modal
      }, error => {
        console.error("Prediction failed:", error);
        this.predictionResult = "Error in prediction!";
        
        // Open the modal on error
        const modalElement = document.getElementById('resultModal');
        this.modal= new Modal(modalElement!); // Create a new modal instance
        this.modal.show();  // Show the modal
      });
  }

  // Set the background color of the modal based on the prediction result
  getModalBackgroundColor() {
    if (this.predictionResult === "The study is expected to be completed.") {
      return 'rgb(0, 128, 0,0.6)';
    } else if (this.predictionResult === "The study is not expected to be completed.") {
      return 'rgba(255, 0, 0, 0.6)';
    } else {
      return 'lightgray';  // Default color'rgba(255, 0, 0, 0.6)'
    }
  }

  
}
