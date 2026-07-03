
import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ObjToParams } from '../utilities/utility';
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
    objdynamicParams=new ObjToParams();
    transactiopn = 'transaction';
  constructor( private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService,
    @Inject('baseURL') private baseURL:string) { }


    getUsers(type:string) {
      return this.http
        .get<any[]>(this.baseURL + type)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
  
    getTransactionbyEntityId(entityId, paramsObj?:any) { 
        let params = '';
        if(paramsObj && Object.keys(paramsObj).length>0){
          params='?'+this.objdynamicParams.dynamicParams(paramsObj);
         
       }
  
        return this.http
          .get<any[]>(this.baseURL +this.transactiopn+'/entityId/'+entityId +params)
          .pipe(catchError(this.processHTTPMsgService.handleError));
      }

      getTransactionByObj(entityId, paramsObj?:any) { 
        let params = '';
        if(paramsObj && Object.keys(paramsObj).length>0){
          params='?'+this.objdynamicParams.dynamicParams(paramsObj);
         
       }
  
        return this.http
          .get<any[]>(this.baseURL +this.transactiopn +params)
          .pipe(catchError(this.processHTTPMsgService.handleError));
      }
}
