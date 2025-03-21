import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EMPTY, from, Observable } from 'rxjs';
import { FormattedDateService } from '../web-app/formatted-date.service';

import { IViolations, ICompany } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);
  private formattedDateService: FormattedDateService =
    inject(FormattedDateService);

  private filterRule = {
    condition: 'AND',
    filterRules: [
      {
        field: 'dateFrom',
        operator: 'equals',
        value: this.formattedDateService.getFormatedDates().sevenDaysAgo,
      },
      {
        field: 'dateTo',
        operator: 'equals',
        value: this.formattedDateService.getFormatedDates().currentDate,
      },
    ],
  };

  constructor() {}

  getAccessibleTenants() {
    return from(
      this.http.get<ICompany[]>(
        'https://app.monitoringdriver.com/api/Tenant/GetAccessibleTenants',
        { withCredentials: true }
      )
    );
  }

  // https://app.monitoringdriver.com/api/FmcsaInspections/GetList

  getDOTInspectionList(tenant: ICompany): Observable<any> {
    return from(
      this.http.post(
        'https://app.monitoringdriver.com/api/FmcsaInspections/GetList',
        {
          filterRule: this.filterRule,
          searchRule: {
            columns: ['driverId', 'driverFullName', 'vehicleName'],
            text: '',
          },
          sorting: 'driverFullName asc',
          skipCount: 0,
          maxResultCount: 25,
        },
        {
          withCredentials: true,
          headers: {
            'X-Tenant-Id': `${tenant.id}`,
          },
        }
      )
    );
  }

  getViolations(tenant: ICompany): Observable<IViolations> {
    return from(
      this.http.post<IViolations>(
        'https://app.monitoringdriver.com/api/Violations/GetViolations',
        {
          filterRule: this.filterRule,
          searchRule: { columns: ['driverName'], text: '' },
          sorting: 'driverName asc',
          skipCount: 0,
          maxResultCount: 25,
        },
        {
          withCredentials: true,
          headers: {
            'X-Tenant-Id': `${tenant.id}`,
          },
        }
      )
    );
  }

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
