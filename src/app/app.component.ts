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
    window.open('index.html', 'popup', 'resizable=no');
  }

  stopGetAllViolations = () => {
    this.gettingAllViolations = false;
    this.progressBar.totalCount = 0;
    this.allViolationsSubscribtion.unsubscribe();
  };

  getAllViolations = () => {
    this.gettingAllViolations = true;
    this.progressBar.constant = 100 / this.tenants.length;
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
              ? (100 / this.tenants.length) * 2.5
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
          alert('Error:\n\t' + error);
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

const mock = [
  {
    company: 'KCE Enterprises, LLC',
    violations: {
      totalCount: 1,
      items: [
        {
          id: 4,
          driverId: ' 0002',
          driverName: 'Barrie Mohamed J',
          violationsCount: 1,
          violations: [
            {
              violationId: '3a18ac74-1c9e-1948-b7c0-5628656e47e0',
              type: 'ThirtyMinutesBreakViolation',
              startTime: '2025-03-15T18:48:34Z',
              endTime: '2025-03-15T19:14:56.50813Z',
              logDate: '2025-03-15T04:00:00Z',
              homeTerminalTimeZone: 'America/New_York',
            },
            {
              violationId: '3a18ac74-1c9e-1238-b7c0-5628656e47e0',
              type: '11 hours violation',
              startTime: '2025-03-15T18:48:34Z',
              endTime: '2025-03-15T19:14:56.50813Z',
              logDate: '2025-03-15T04:00:00Z',
              homeTerminalTimeZone: 'America/New_York',
            },
          ],
        },
      ],
    },
  },
  {
    company: 'PHP 7 Express, INC',
    violations: {
      totalCount: 1,
      items: [
        {
          id: 6,
          driverId: '  161',
          driverName: 'Mileta Sarovic',
          violationsCount: 1,
          violations: [
            {
              violationId: '3a18ad5d-4ee1-ec64-4e06-ff67423a1d2e',
              type: 'ThirtyMinutesBreakViolation',
              startTime: '2025-03-15T18:04:07.568Z',
              endTime: '2025-03-15T19:14:58.5059667Z',
              logDate: '2025-03-15T05:00:00Z',
              homeTerminalTimeZone: 'America/Chicago',
            },
          ],
        },
      ],
    },
  },
];
