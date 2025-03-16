import { Component, Input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { IViolations } from '../../interfaces';
import { MatDivider, MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-violations',
  imports: [MatDialogModule, MatButtonModule, MatDivider],
  templateUrl: './violations.component.html',
  styleUrl: './violations.component.scss',
})
export class ViolationsComponent {
  @Input() violations: { company: string; violations: IViolations }[] = [];

  constructor() {}
}
