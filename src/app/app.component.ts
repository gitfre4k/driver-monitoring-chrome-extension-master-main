import { Component, inject } from '@angular/core';
import { ApiService } from './api/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'driver-monitoring-chrome-extension';

  private apiService: ApiService = inject(ApiService);

  driverDailyLog$ = this.apiService.getDriverDailyLog();

  constructor() {}

  getLogs = () => {
    console.log('Getting logs 1...');
    this.driverDailyLog$.subscribe((data) => {
      console.log(data);
    });
  };

  getTabId = (callback: (tabId: number) => void) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        callback(tabs[0].id!);
      } else {
        console.error('No active tab found');
      }
    });
  };

  getLocalStorage = () => {
    console.log('Getting local storage...');
    this.getTabId((tabId) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: () => localStorage.getItem('MASTER_TOOLS_PROVIDER_TENANT'),
        },
        (results) => {
          if (results && results[0] && !chrome.runtime.lastError) {
            console.log(results[0].result);
          } else {
            console.error(chrome.runtime.lastError);
          }
        }
      );
    });
  };
}
