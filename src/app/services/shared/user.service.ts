
import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor( private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService,
    @Inject('baseURL') private baseURL:string) { }


    getUsers(type:string) {
      return this.http
        .get<any[]>(this.baseURL + type)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    createProfile(type:string, data: any) {
      console.log('post call with: ', data);
      return this.http

        .post(this.baseURL + type, data)
        .pipe(catchError(this.processHTTPMsgService.handleError))
        .subscribe((data) => console.log('return: ', data));
    }
    getSingleUser(type:string, id: string): Observable<any> {
      return this.http
        .get<any>(this.baseURL + type+'/' + id)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getProfile(type:string, userId: string): Observable<any> {
      return this.http
        .get<any>(this.baseURL + type+'?userId=' + userId)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    updateUser(type:string, data: any, id:string) {
      console.log('dell with headers: ');
      return this.http
        .put(this.baseURL + type+'/' + id, data)
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        )
        .subscribe((data) => console.log('return: ', data));
    }
    deleteAffiliate(type:string ,id: string) {
      console.log('dell with headers: ');
      return this.http
        .delete(this.baseURL +type+ '/' + id)
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        );
    }
}
