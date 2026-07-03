import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GenericService {
  invoices: any;
  invoice: any;

  constructor( private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService,
    @Inject('baseURL') private baseURL:string) { }


    getAll(type:any) {
      return this.http
        .get<any[]>(this.baseURL + type)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    getPaginated(type:string,perPageData:number,lastId:string) {
      return this.http
        .get<any[]>(this.baseURL + type + '/'+ perPageData + '/'+lastId)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    create(type:any,data: any) {
      console.log('post call with: ', data);
      return this.http
        .post(this.baseURL + type, data)
        .pipe(catchError(this.processHTTPMsgService.handleError))
        
    }

    //pdf
    createInvoicePdf(type:any,data: any) {
      console.log('post call with: ', data);
      return this.http
        .post(this.baseURL + type, data,{ responseType: 'blob' })
        .pipe(catchError(this.processHTTPMsgService.handleError))
        
    }

    updateInvoicePdf(type:any, data: any, id:string) {
      console.log('dell with headers: ');
      return this.http
        .put(this.baseURL + type+'/reportpdf/' + id, data,{ responseType: 'blob' })
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        )
        
    }
    getSingle(type:any,id: string): Observable<any> {
      return this.http
        .get<any>(this.baseURL + type+ '/' + id)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getByUserId(type:any,userId: string): Observable<any> {
      return this.http
        .get<any>(this.baseURL + type+'?userId=' + userId)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    
    getByKeyValue(type:any,key: string,value:any): Observable<any> {
      return this.http
        .get<any>(this.baseURL + type+'?' +key+ '=' + value)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    updateById(type:any, data: any, id:string) {
      console.log('dell with headers: ');
      return this.http
        .put(this.baseURL + type+'/' + id, data)
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        )
        
    }

    //date wise
    getDateWise(type:any,data: any) {
      console.log('post call with: ', data);
      return this.http
        .post(this.baseURL + type, data)
        .pipe(catchError(this.processHTTPMsgService.handleError))
        
    }
    deleteSingle(type:any,id: string) {
      console.log('dell with headers: ');
      return this.http
        .delete(this.baseURL + type+'/' + id)
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        );
    }

    getCount(type: string, query: string=''): Observable<any> {
      return this.http.get<any>(this.baseURL + `count/${type}${query}`)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    getInvoiceByType(type: string, value: string): Observable<any> {
      return this.http.get<any>(this.baseURL + `invoice?${type}=${value}`)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
}
