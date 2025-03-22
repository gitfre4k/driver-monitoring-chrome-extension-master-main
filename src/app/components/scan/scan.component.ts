import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Subscription } from 'rxjs';

import { ScanService } from '../../services/scan.service';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-scan',
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    ProgressBarComponent,
  ],
  templateUrl: './scan.component.html',
  styleUrl: './scan.component.scss',
})
export class ScanComponent {
  allViolationsSubscribtion = new Subscription();

  private scanService: ScanService = inject(ScanService);
  private destroyRef = inject(DestroyRef);

  scanning = this.scanService.scanning;

  constructor() {}

  ngOnInit() {
    this.destroyRef.onDestroy(() =>
      this.allViolationsSubscribtion.unsubscribe()
    );
  }

  getAllViolations = () => {
    this.allViolationsSubscribtion = this.scanService
      .getAllViolations()
      .subscribe({
        next: (violations) => {
          this.scanService.handleViolations(violations);
        },
        error: (error) => {
          this.scanService.handleError(error);
        },
        complete: () => {
          this.scanService.handleComplete();
        },
      });
  };
}
