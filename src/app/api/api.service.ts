import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);
  private AspNetCore = chrome.cookies.get(
    {
      url: 'https://app.monitoringdriver.com',
      name: '.AspNetCore.Cookies',
    },
    (cookie) => {
      console.log(cookie);
      return cookie?.value;
    }
  );
  private AWSALBTG = chrome.cookies.get(
    { url: 'https://app.monitoringdriver.com', name: 'AWSALBTG' },
    (cookie) => {
      console.log(cookie);
      return cookie?.value;
    }
  );
  private AWSALBTGCORS = chrome.cookies.get(
    { url: 'https://app.monitoringdriver.com', name: 'AWSALBTGCORS' },
    (cookie) => {
      console.log(cookie);
      return cookie?.value;
    }
  );
  constructor() {}

  getDriverDailyLog(): Observable<any> {
    const body = { driverId: 43, logDate: '2025-03-09T23:00:00.000Z' };
    return this.http.post(
      'https://app.monitoringdriver.com/api/Logs/GetDriverDailyLog',
      body,
      {
        withCredentials: true,
        headers: {
          Cokkie:
            this.AspNetCore + '; ' + this.AWSALBTG + '; ' + this.AWSALBTGCORS,
          'X-Tenant-Id': '3a13ca94-18b5-41be-4a36-7f024111c52a',
        },
      }
    );
  }
}
