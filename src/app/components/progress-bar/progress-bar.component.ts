import { Component, inject } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { ScanService } from '../../services/scan.service';

@Component({
  selector: 'app-progress-bar',
  imports: [MatCardModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  private scanService: ScanService = inject(ScanService);

  progressBar = this.scanService.progressBar;
  stopGetAllViolations = this.scanService.stopGetAllViolations;
  errors = this.scanService.errors;
  scanning = this.scanService.scanning;
}
