import { Component, Input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IViolations } from '../../interfaces';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-violations',
  imports: [MatDialogModule, MatButtonModule, MatDivider, MatIconModule],
  templateUrl: './violations.component.html',
  styleUrl: './violations.component.scss',
})
export class ViolationsComponent {
  @Input() violations: { company: string; violations: IViolations }[] = [];

  constructor() {}
}
