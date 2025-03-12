import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UrlParamsService {
  constructor() {}

  getTabId = (callback: (tabId: number) => void) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        callback(tabs[0].id!);
      } else {
        console.error('No active tab found');
      }
    });
  };

  getDataFromChrome = (
    callback: (
      result: { driverID: number; logDate: string; tenantId: string } | null
    ) => void
  ) => {
    this.getTabId((tabId) => {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => {
            const providerTenant = localStorage.getItem(
              'MASTER_TOOLS_PROVIDER_TENANT'
            );
            console.log(
              providerTenant,
              JSON.parse(providerTenant!).prologs.id.valueOf()
            );
            const url = window.location.href;
            const regex = /\/logs\/(\d+)\/([\d-T:.]+)/;
            const matches = url.match(regex);
            if (matches && providerTenant) {
              return {
                driverID: +matches[1],
                logDate: matches[2],
                tenantId: JSON.parse(providerTenant).prologs.id,
              };
            }
            return null;
          },
        },
        (results) => {
          if (results && results[0] && !chrome.runtime.lastError) {
            const result = results[0].result;
            if (result) {
              callback(result);
            } else {
              console.error('No result found');
              callback(null);
            }
          } else {
            console.error(chrome.runtime.lastError);
            callback(null);
          }
        }
      );
    });
  };
}
