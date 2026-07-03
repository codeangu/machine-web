import { HttpClient } from '@angular/common/http';
import { Inject,Injectable } from '@angular/core';
import { ProcessHTTPMsgService } from '../auth/process-httpmsg.service';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
// import { Role } from 'src/app/shared/constant/roles';
import { ObjToParams } from '../utility';

@Injectable({
  providedIn: 'root'
})
export class UserService {
    userTerritoryQuery=null;
    objToParams=new ObjToParams();
  constructor( private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService,
    @Inject('baseURL') private baseURL:string, private auth:AuthService) { 
      this.auth.getUserDetails()
      // .subscribe({
      //   next:(user )=> {
      //     if(user.role === Role.ssAdmin || user.role === Role.admincci){
      //       this.userTerritoryQuery=''
      //     }else if(user.Territory){
      //       this.userTerritoryQuery = 'Territory='+ user.Territory;
      //     }
      //     console.log("user in complaint service ", user.Territory);
      //   }
      // })
      
    }


    getAllUsers() {
      return this.http
        .get<any[]>(this.baseURL + 'users?active=true&'+this.userTerritoryQuery )
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getfreezeUsers() {
      return this.http
        .get<any[]>(this.baseURL + 'users?active=false&'+this.userTerritoryQuery )
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getUserByRole(role:string,) {
      
      return this.http
        .get<any[]>(this.baseURL + 'users?active=true&role='+role+'&'+this.userTerritoryQuery )
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    getTechByParams(role:string,paramsObj:any) {
      let params = '';
      if(Object.keys(paramsObj).length>0){
         params='&'+this.objToParams.toParams(paramsObj);
      }
      return this.http
        .get<any[]>(this.baseURL + 'users?active=true&role='+role+params)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    getPaginatedUsers(perPageData:number,lastId:string) {
      return this.http
        .get<any[]>(this.baseURL + 'users?active=true' + '/'+ perPageData + '/'+lastId+'&'+this.userTerritoryQuery)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
   
    getSingleUser(type:any,id: string): Observable<any> {
      
      return this.http
        .get<any>(this.baseURL + 'users/' + id)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    changePassword(data: any) {
      return this.http
        .post(this.baseURL + 'users/changepassword' , data)
        .pipe(catchError(this.processHTTPMsgService.handleError))  
    }
    getUserByKeyValue(key: string,value:any): Observable<any> {
   
      return this.http
        .get<any>(this.baseURL + 'users?active=true&' +key+ '=' + value +"&"+this.userTerritoryQuery)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }
    updateUser( data: any, id:string) {
      return this.http
        .put(this.baseURL + 'users'+'/' + id, data)
        .pipe(
          catchError((error) => this.processHTTPMsgService.handleError(error))
        )   
    }

    getAllCount(): Observable<any> {
  
      return this.http.get<any>(this.baseURL + 'count/users?active=true&'
      +this.userTerritoryQuery)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    getCountByRole(role:string): Observable<any> {
 
      return this.http.get<any>(this.baseURL + 'count/users?active=true&role='+role +'&'+this.userTerritoryQuery)
        .pipe(catchError(this.processHTTPMsgService.handleError));
    }

    // //date wise
    // getDateWise(type:any,data: any) {
    //   console.log('post call with: ', data);
    //   return this.http
    //     .post(this.baseURL + type, data)
    //     .pipe(catchError(this.processHTTPMsgService.handleError))
        
    // }
    // deleteSingle(type:any,id: string) {
    //   console.log('dell with headers: ');
    //   return this.http
    //     .delete(this.baseURL + type+'/' + id)
    //     .pipe(
    //       catchError((error) => this.processHTTPMsgService.handleError(error))
    //     );
    // }

   
}
