import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { UrlParamsService } from './chrome/url-params.service';
import { from, interval, Observable, of, Subject } from 'rxjs';
import { concatMap, delay, map, mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'driver-monitoring-chrome-extension';

  private apiService: ApiService = inject(ApiService);
  private urlParamsService: UrlParamsService = inject(UrlParamsService);

  tenants!: { id: string, name: string }[];

  constructor() { }

  ngOnInit() {
    this.apiService.getAccessibleTenants().pipe(map(companies => {
      console.log(companies)
      return companies.map(c => c)
    })).subscribe({
      next: (q) => { this.tenants = q; console.log(this.tenants) }
    })
  }

  getAllViolations = () => {
    const tenantsIds$ = from(this.tenants)
    tenantsIds$.pipe(
      concatMap(t => this.apiService.getViolation(t))
    ).subscribe({
      next: (v) => console.log(v),
      error: (error) =>
        console.error('Error:', error),
      complete: () =>
        console.log('Completed processing violations.')

    })
  }

  // .pipe(map((tenants) => tenants.forEach((company) => of(company.id))), concatMap((company) => this.apiService.getViolations(id)))

  // .subscribe({
  //   next: (tenants: any) => {
  //     console.log(tenants);
  //     for (let t in tenants) {
  //       console.log(tenants[t].name);
  //       console.log(tenants[t].id);
  //     }
  //   },
  //   error: (error) => {
  //     console.error(error);
  //   },
  // });
  // }

  // getAllViolations = () => {
  //   this.apiService.getAccessibleTenants().pipe(
  //     map((tenants: any) => ),
  //     concatMap(this.apiService.getViolations())
  //   );
  // };

  // this.apiService.getAccessibleTenants().pipe(
  //   // concatMap(
  //   //   (tenants: any) => {
  //   //     return this.apiService.getViolations
  //   //   }
  //   // )
  // )

  //   this.apiService.getViolations().subscribe({
  //     next: (data) => {
  //       console.log(data);
  //     },
  //     error: (error) => {
  //       console.error(error);
  //     },
  //   });
  // };

  // getViolations = () => {
  //   this.apiService.getViolations().subscribe({
  //     next: (data) => {
  //       console.log(data);
  //     },
  //     error: (error) => {
  //       console.error(error);
  //     },
  //   });
  // };

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
