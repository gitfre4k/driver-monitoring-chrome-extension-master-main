import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);

  constructor() {}

  getDriverDailyLogEvents(
    driverId: number,
    logDate: string,
    tenantId: string
  ): Observable<any> {
    const body = { driverId, logDate };
    console.log(123123, driverId, logDate, tenantId);
    return this.http.post(
      'https://app.monitoringdriver.com/api/Logs/GetDriverDailyLog',
      body,
      {
        withCredentials: true,
        headers: {
          'X-Tenant-Id': `${tenantId}`,
        },
      }
    );
  }
}
