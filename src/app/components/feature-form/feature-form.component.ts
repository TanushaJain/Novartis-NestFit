import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';  
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
  modal: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.featureForm = this.fb.group({
      enrollment: ['', Validators.required],
      studyDuration: ['', Validators.required],
      startDateYear: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
      startDateMonth: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
      completionDateYear: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
      completionDateMonth: ['', [Validators.required, Validators.pattern("^[0-9]+$")]],
      enrollmentMissing: ['', Validators.required],
      enrollmentScaled: ['', Validators.required],
      sex: ['', Validators.required],
      healthyVolunteers: ['', Validators.required],
      studyType: ['', Validators.required],
      funderType: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.featureForm.invalid) {
      return;
    }

    const formData = this.featureForm.value;

    let formattedData: any = {
      "Enrollment": Number(formData.enrollment),
      "Study Duration": Number(formData.studyDuration),
      "Start Date_Year": Number(formData.startDateYear),
      "Start Date_Month": Number(formData.startDateMonth),
      "Completion Date_Year": Number(formData.completionDateYear),
      "Completion Date_Month": Number(formData.completionDateMonth),
      "Enrollment_missing": formData.enrollmentMissing === "yes" ? 1 : 0,
      "Enrollment_Scaled": Number(formData.enrollmentScaled),
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
        this.predictionResult = response.prediction === 1 
          ? "The study is expected to be completed." 
          : "The study is not expected to be completed.";

        const modalElement = document.getElementById('resultModal');
        this.modal = new Modal(modalElement!);
        this.modal.show();
      }, error => {
        console.error("Prediction failed:", error);
        this.predictionResult = "Error in prediction!";
        
        const modalElement = document.getElementById('resultModal');
        this.modal = new Modal(modalElement!);
        this.modal.show();
      });
  }

  getModalBackgroundColor() {
    if (this.predictionResult === "The study is expected to be completed.") {
      return 'rgb(0, 128, 0,0.6)';
    } else if (this.predictionResult === "The study is not expected to be completed.") {
      return 'rgba(255, 0, 0, 0.6)';
    } else {
      return 'lightgray';
    }
  }
}
