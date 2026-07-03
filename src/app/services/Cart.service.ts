// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class CartService {
//   private cartSubject = new BehaviorSubject<any[]>([]);
//   cart$ = this.cartSubject.asObservable();

//   updateCart(cartItems: any[]) {
//     this.cartSubject.next(cartItems);
//   }

//   getCartItems() {
//     return this.cartSubject.getValue();
//   }
// }



import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs'; //.....for search

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private viewEventSubject = new Subject<void>();

  viewEvent$ = this.viewEventSubject.asObservable();

  triggerViewEvent() {
    this.viewEventSubject.next();
  }
  // ................................................
  private searchTerm = new BehaviorSubject<string>(''); 
  currentSearchTerm = this.searchTerm.asObservable();
  setSearchTerm(term: string) {
    this.searchTerm.next(term);
  }


  // ..........................data shared...............................
  private dataSubject = new BehaviorSubject<string>('');
  currentData$ = this.dataSubject.asObservable();

  updateData(newData: string) {
    console.log('cart service', newData);
    this.dataSubject.next(newData); 
  }
}