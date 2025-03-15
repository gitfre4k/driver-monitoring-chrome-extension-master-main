import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { UrlParamsService } from './chrome/url-params.service';
import { forkJoin, from, interval, Observable, of, Subject } from 'rxjs';
import { concatMap, delay, map, mergeMap, tap } from 'rxjs/operators';

import { IViolations, ICompany } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  tenants: { id: string; name: string }[] = [];
  violations: { company: string; violations: IViolations }[] = [];

  private apiService: ApiService = inject(ApiService);
  private urlParamsService: UrlParamsService = inject(UrlParamsService);

  constructor() {}

  ngOnInit() {
    this.apiService
      .getAccessibleTenants()
      .pipe(
        map((companies) => {
          console.log(companies);
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

  popUp() {
    // chrome.tabs.create({ url: 'index.html' });
    window.open('index.html', 'newWindow', 'resizable=no');
  }

  getAllViolations = () => {
    const tenants$ = from(this.tenants);
    let currentCompany: ICompany;

    tenants$
      .pipe(
        concatMap((tenant) => {
          currentCompany = tenant;
          return this.apiService.getViolations(tenant);
        })
      )
      .subscribe({
        next: (violations) => {
          console.log(violations);
          if (violations.totalCount > 0) {
            for (let i = 0; i < violations.totalCount; i++) {
              this.violations.push({
                company: currentCompany.name,
                violations,
              });
            }
          }
        },
        error: (error) => console.error('Error:', error),
        complete: () => {
          console.log('Completed processing violations.');
          console.log(this.violations);
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

[
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
