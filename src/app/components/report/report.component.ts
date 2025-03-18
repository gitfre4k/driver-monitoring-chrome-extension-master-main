import { Component, Input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IViolations } from '../../interfaces';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-report',
  imports: [MatDialogModule, MatButtonModule, MatDivider, MatIconModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
})
export class ReportComponent {
  @Input() violations: { company: string; violations: IViolations }[] = [];

  constructor() {}
}
