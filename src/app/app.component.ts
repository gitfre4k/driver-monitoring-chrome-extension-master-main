import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { UrlParamsService } from './chrome/url-params.service';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'driver-monitoring-chrome-extension';

  private apiService: ApiService = inject(ApiService);
  private urlParamsService: UrlParamsService = inject(UrlParamsService);

  constructor() {}

  getAccessibleTenants = () => {
    this.apiService.getAccessibleTenants();
  };

  // getTenants = () => {
  //   this.apiService
  //     .getAccessibleTenants()
  //     .pipe(
  //       concatMap((tenants) => {
  //         tenants.forEach(company => )
  //       })
  //     )

  //     .subscribe();

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
  //   concatMap(
  //     (tenants: any) => {
  //       return this.apiService.getViolations
  //     }
  //   )
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
