import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { UrlParamsService } from './chrome/url-params.service';
import { from, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { IViolations, ICompany, IProgressBar } from './interfaces';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ViolationsComponent } from './components/violations/violations.component';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    MatListModule,
    MatDialogModule,
    MatProgressBarModule,
    MatTabsModule,
    MatIconModule,
  ],
})
export class AppComponent {
  title = 'driver-monitoring-chrome-extension';

  tenants: { id: string; name: string }[] = [];
  violations: { company: string; violations: IViolations }[] = [];

  gettingAllViolations = false;

  progressBar: IProgressBar = {
    mode: 'determinate',
    value: 0,
    bufferValue: 0,
    constant: 0,
    currentCompany: '',
    totalCount: 0,
  };

  allViolationsSubscribtion = new Subscription();

  readonly dialog = inject(MatDialog);

  private apiService: ApiService = inject(ApiService);
  private urlParamsService: UrlParamsService = inject(UrlParamsService);

  constructor() {}

  ngOnInit() {
    this.apiService
      .getAccessibleTenants()
      .pipe(
        map((companies) => {
          return companies.map((c) => c);
        })
      )
      .subscribe({
        next: (company) => {
          this.tenants = company;
          console.log(this.tenants);
        },
      });
  }

  openDialog() {
    const dialogRef = this.dialog.open(ViolationsComponent);
    let instance = dialogRef.componentInstance;
    instance.violations = this.violations;
    dialogRef.afterClosed().subscribe(() => this.stopGetAllViolations());
  }

  popUp() {
    // window.open('index.html', 'popup', 'resizable=no');
    const windowFeatures =
      'resizable=no,target="dmcev001win",left=100,top=100,width=536,height=640';
    window.open('index.html', '', windowFeatures);
    window.close();
  }

  stopGetAllViolations = () => {
    this.gettingAllViolations = false;
    this.progressBar.totalCount = 0;
    this.allViolationsSubscribtion.unsubscribe();
  };

  getAllViolations = () => {
    this.gettingAllViolations = true;
    this.progressBar.constant = 100 / this.tenants.length + 0.2;
    this.progressBar.value = 0;
    this.progressBar.mode = 'determinate';

    this.violations = [];
    const tenants$ = from(this.tenants);
    let currentCompany: ICompany;

    this.allViolationsSubscribtion = tenants$
      .pipe(
        concatMap((tenant) => {
          currentCompany = tenant;
          this.progressBar.currentCompany = currentCompany.name;
          return this.apiService.getViolations(tenant);
        })
      )
      .subscribe({
        next: (violations) => {
          console.log(violations);
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
          alert('Error:\n\t' + error.name + '\n\t' + error.message);
          this.progressBar.value = 0;
          this.gettingAllViolations = false;
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

  getEvents = () => {
    let driverId: number;
    let logDate: string;
    let tenantId: string;
    this.urlParamsService.getDataFromChrome((result) => {
      if (result) {
        driverId = result.driverID;

        logDate = result.logDate;

        tenantId = result.tenantId;

        this.apiService
          .getDriverDailyLogEvents(driverId, logDate, tenantId)
          .subscribe({
            next: (data) => {
              console.log('Daily logs: ', data);
              console.log('Company Name:', data.companyName);
              console.log('Driver Name', data.driverFullName);
              console.log('Events: ', data.events);

              for (let i in data.events) {
                console.log('Duty status: ', data.events[i].dutyStatus);
                console.log('Odometer: ', data.events[i].odometer);
              }
            },
            error: (error) => {
              console.error(error);
            },
          });
      } else {
        console.error('No result found');
      }
    });
  };
}

// mock
