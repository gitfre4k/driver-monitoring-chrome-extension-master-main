import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { ICompany, IProgressBar, IViolations } from '../../interfaces';
import { ApiService } from '../../api/api.service';
import {
  catchError,
  concatMap,
  from,
  mergeMap,
  of,
  Subscription,
  tap,
} from 'rxjs';

import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-violations',
  imports: [
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatProgressBarModule,
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './violations.component.html',
  styleUrl: './violations.component.scss',
})
export class ViolationsComponent {
  errorReport: string = '';
  gettingAllViolations = false;
  violations: { company: string; violations: IViolations }[] = [];
  errors: { error: { name: string; message: string }; company: ICompany }[] =
    [];

  progressBar: IProgressBar = {
    mode: 'determinate',
    value: 0,
    bufferValue: 0,
    constant: 0,
    currentCompany: '',
    totalCount: 0,
  };

  allViolationsSubscribtion = new Subscription();

  private apiService: ApiService = inject(ApiService);
  readonly dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  constructor() {}

  ngOnInit() {}

  generateErrorReport() {
    navigator.clipboard.writeText(this.errorReport);
    this._snackBar.open('Copied successfully', 'OK', { duration: 2000 });
  }

  stopGetAllViolations = () => {
    this.gettingAllViolations = false;
    this.progressBar.totalCount = 0;
    this.allViolationsSubscribtion.unsubscribe();
  };

  openDialog() {
    const dialogRef = this.dialog.open(ReportComponent);
    let instance = dialogRef.componentInstance;
    instance.violations = this.violations;
    dialogRef.afterClosed().subscribe(() => this.stopGetAllViolations());
  }

  getAllViolations = () => {
    this.violations = [];
    this.errors = [];
    let currentCompany: ICompany;

    const tenants$ = this.apiService.getAccessibleTenants().pipe(
      tap((tenants) => {
        this.gettingAllViolations = true;
        this.progressBar.constant = 105 / tenants.length;
        this.progressBar.value = this.progressBar.constant;
        this.progressBar.mode = 'determinate';
      }),
      mergeMap((tenants) => from(tenants))
    );

    this.allViolationsSubscribtion = tenants$
      .pipe(
        concatMap((tenant) => {
          currentCompany = tenant;
          this.progressBar.currentCompany = currentCompany.name;
          return this.apiService.getViolations(tenant).pipe(
            tap({
              error: (error) =>
                this.errors.push({ error, company: currentCompany }),
            }),
            catchError(() => of())
          );
        })
      )
      .subscribe({
        next: (violations) => {
          console.log(violations);
          console.log(this.errors);
          this.progressBar.value =
            this.progressBar.value === 0
              ? this.progressBar.constant
              : this.progressBar.value + this.progressBar.constant;
          console.log(this.progressBar.value);
          if (violations.totalCount > 0) {
            this.progressBar.totalCount =
              this.progressBar.totalCount + violations.totalCount;
            this.violations.push({
              company: currentCompany.name,
              violations,
            });
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this._snackBar
            .open('An error occurred', 'Close')
            .afterDismissed()
            .pipe(
              tap((err) => {
                this.errorReport = JSON.stringify({
                  source: 'Violation Error Report',
                  time: Date.now(),
                  error,
                  err,
                  violations: this.violations,
                  currentCompany,
                });
                this.progressBar.value = 0;
                this.gettingAllViolations = false;
              })
            )
            .subscribe();
        },
        complete: () => {
          this.progressBar.value = 100;
          console.log('Completed processing violations.');
          console.log(this.violations);
          this.gettingAllViolations = false;
          this.openDialog();
          this.progressBar.value = 0;
        },
      });
  };
}
