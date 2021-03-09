import { Injectable } from '@angular/core';

import { BehaviorSubject } from "rxjs"; 
@Injectable({
  providedIn: 'root'
})
export class DatasourceService {

  constructor() { }
    private dataSource = new BehaviorSubject("default message");
    serviceData = this.dataSource.asObservable();

    changeData(data: any) {
      this.dataSource.next(data);
    }
}
