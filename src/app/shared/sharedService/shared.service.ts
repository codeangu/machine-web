import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private dataSubject = new BehaviorSubject<string>(''); // Default value
  currentData$ = this.dataSubject.asObservable();

  updateData(newData: string) {
    this.dataSubject.next(newData); // Update data and notify subscribers
  }
}
