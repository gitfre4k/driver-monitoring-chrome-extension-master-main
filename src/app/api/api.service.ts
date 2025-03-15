import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of } from 'rxjs';

interface Company {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);
  // companies: Company[];

  constructor() {}

  getAccessibleTenants() {
    return from(
      this.http.get<Observable<Company[]>>(
        'https://app.monitoringdriver.com/api/Tenant/GetAccessibleTenants',
        { withCredentials: true }
      )
    );
  }

  // https://app.monitoringdriver.com/api/Violations/GetViolations

  getViolations(tenantId: string) {
    return this.http.post(
      'https://app.monitoringdriver.com/api/Violations/GetViolations',
      {
        searchRule: { columns: ['driverName'], text: '' },
        sorting: 'driverName asc',
        skipCount: 0,
        maxResultCount: 25,
      },
      {
        withCredentials: true,
        headers: {
          'X-Tenant-Id': `${tenantId}`,
        },
      }
    );
  }

  // '3a13ca94-18b5-41be-4a36-7f024111c52a'

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
