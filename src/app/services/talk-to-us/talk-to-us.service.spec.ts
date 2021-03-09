import { TestBed } from '@angular/core/testing';

import { TalkToUsService } from './talk-to-us.service';

describe('TalkToUsService', () => {
  let service: TalkToUsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TalkToUsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
