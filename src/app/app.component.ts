import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FeatureFormComponent } from './components/feature-form/feature-form.component';
import { UploadExcelComponent } from './components/upload-excel/upload-excel.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatMenuModule,
    MatButtonModule,
    FeatureFormComponent,
    UploadExcelComponent
  ]
})
export class AppComponent {
  selectedComponent: string = 'form';
    leftLogo = '/Novartis-Logo.png';
    rightLogo = '/Team Name.png';
  

  switchComponent(component: string) {
    this.selectedComponent = component;
  }
}
