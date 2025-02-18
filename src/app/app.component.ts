import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeatureFormComponent } from './components/feature-form/feature-form.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [FeatureFormComponent,RouterOutlet,CommonModule,HttpClientModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
  export class AppComponent {
}

