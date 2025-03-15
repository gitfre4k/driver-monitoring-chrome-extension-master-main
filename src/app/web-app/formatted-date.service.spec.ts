import { TestBed } from '@angular/core/testing';

import { FormattedDateService } from './formatted-date.service';

describe('FormattedDateService', () => {
  let service: FormattedDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormattedDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
