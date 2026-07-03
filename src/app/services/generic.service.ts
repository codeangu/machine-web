import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: any;
}

@Injectable({ providedIn: 'root' })
export class GenericService {
  private baseUrl = environment.baseURL;

  constructor(private http: HttpClient) {}

  // Server-side paginated fetch. Always sends `page` so backend returns the
  // { data, total, page, limit, totalPages, summary } shape.
  getPaged<T>(endpoint: string, params: any): Observable<Paged<T>> {
    let httpParams = new HttpParams();
    Object.keys(params || {}).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<Paged<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  // Filter with dynamic params
  filter<T>(modelName: string, params: any): Observable<T[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<T[]>(`${this.baseUrl}/filter/${modelName}`, { params: httpParams });
  }

  // Standard CRUD
  create<T>(endpoint: string, data: any): Observable<T> { return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data); }
  getAll<T>(endpoint: string): Observable<T[]> { return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`); }

  // GET with query params (e.g. date range { from, to })
  getAllWithParams<T>(endpoint: string, params: any): Observable<T[]> {
    let httpParams = new HttpParams();
    Object.keys(params || {}).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.append(key, params[key]);
      }
    });
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }
  getById<T>(endpoint: string, id: string): Observable<T> { return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`); }
  update<T>(endpoint: string, id: string, data: any): Observable<T> { return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data); }
  delete<T>(endpoint: string, id: string): Observable<T> { return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}`); }

  // Admin: sab users ka data (role=admin hona zaroori hai backend pe)
  getAllAdmin<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: { admin: 'true' } });
  }

  // Search: name/model/barcode se product dhundho
  search<T>(endpoint: string, term: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: { search: term } });
  }
}