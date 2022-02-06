import { TestBed } from '@angular/core/testing';

import { StreamingServicesService } from './streaming-services.service';

describe('StreamingServicesService', () => {
  let service: StreamingServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamingServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
