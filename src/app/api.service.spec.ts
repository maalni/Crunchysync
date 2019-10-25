import { TestBed, inject } from '@angular/core/testing';

import { apiService } from './data.service';

describe('apiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [apiService]
    });
  });

  it('should be created', inject([apiService], (service: apiService) => {
    expect(service).toBeTruthy();
  }));
});
