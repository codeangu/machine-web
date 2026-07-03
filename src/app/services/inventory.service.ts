import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  constructor(private http: HttpClient) { }

  // Inventory API with path variables and query params
  getInventory(limit: number = 20, page: number = 1, searchTerm: string = '', category: string = ''): Observable<any> {
    let url = `https://ilahi-bakhsh-6ed5d9a17a3e.herokuapp.com/pos/inventory/${limit}/${page}/desc`;

    let queryParams = [];
    if (searchTerm) queryParams.push(`productName=${searchTerm}`);
    if (category && category !== 'ALL') queryParams.push(`categoryName=${category}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    return this.http.get<any>(url);
  }

  // Category API
  getCategories(): Observable<any> {
    return this.http.get<any>(`https://ilahi-bakhsh-6ed5d9a17a3e.herokuapp.com/pos/category`);
  }
}