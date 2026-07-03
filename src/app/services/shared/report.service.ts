
import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ObjToParams } from '../utilities/utility';
import { apiType } from 'src/app/shared/constant/api-type';
@Injectable({
  providedIn: 'root'
})
export class ReportService {
    objdynamicParams=new ObjToParams();
    apiType = apiType.saleReport;
  constructor( private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService,
    @Inject('baseURL') private baseURL:string) { }


    getAllProductProfit(type:string) {
      return this.http
        .get<any[]>(this.baseURL + type+'/productwiseprofit')
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
  
    getSingleProductProfit(type, productRef) { 
      
  
        return this.http
          .get<any[]>(this.baseURL +type+'/productwiseprofit/'+productRef)
          .pipe(catchError(this.processHTTPMsgService.handleError));
      }

}
