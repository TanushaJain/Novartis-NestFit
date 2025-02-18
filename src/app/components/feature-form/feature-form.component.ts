import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

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

  featureOrder = [
    "Enrollment", "Study Duration", "Start Date_Year", "Start Date_Month",
    "Completion Date_Year", "Completion Date_Month", "Enrollment_missing",
    "Enrollment_Scaled", "Sex_ALL", "Sex_FEMALE", "Sex_MALE", "Age_ADULT",
    "Age_ADULT_ OLDER_ADULT", "Age_CHILD", "Age_CHILD_ ADULT", "Age_OLDER_ADULT",
    "StudyType_INTERVENTIONAL", "StudyType_OBSERVATIONAL", "FunderType_INDIV",
    "FunderType_INDUSTRY", "FunderType_NIH", "FunderType_OTHER", "reason_Adverse Event",
    "reason_Death", "reason_Lost to Follow_up", "reason_Others", "reason_Physician Decision",
    "reason_Withdrawal by Subject", "minimum_age", "maximum_age", "healthy_volunteers",
    "is_age_limited", "criteria_length", "inclusion_criteria_count", "exclusion_criteria_count",
    "event_count", "frequency_threshold", "subject_impact_ratio", "ctgov_group_code_encoded",
    "organ_system_encoded", "adverse_event_term_encoded"
  ];

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
  }, error => {
    console.error("Prediction failed:", error);
    this.predictionResult = "Error in prediction!";
  });

  }
  
  
}
