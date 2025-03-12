import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { UrlParamsService } from './chrome/url-params.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'driver-monitoring-chrome-extension';
  localStorrage: any;

  driverDailyLogEvents$!: Observable<any>;

  private apiService: ApiService = inject(ApiService);
  private urlParamsService: UrlParamsService = inject(UrlParamsService);

  constructor() {}

  ngOnInit() {}

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
