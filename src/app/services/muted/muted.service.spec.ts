import { TestBed } from '@angular/core/testing';

import { MutedService } from './muted.service';

describe('MutedService', () => {
  let service: MutedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MutedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
