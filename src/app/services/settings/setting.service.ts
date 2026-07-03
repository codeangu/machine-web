import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { InitialStyles } from 'src/app/shared/constant/usersStyles';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private dataSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  public data$: Observable<any> = this.dataSubject.asObservable();
  localUsername:any
  constructor(authService:AuthService) {
    // Retrieve the initial data from local storage
    const localUser = localStorage.getItem('JWT');
    const UserRole:string = authService.getUserRole();
    this.localUsername = JSON.parse(localUser).username;
    const jsonUserSettings = localStorage.getItem(this.localUsername);
    const initStyles = InitialStyles[UserRole];
    console.log("jsonUserSettings ",jsonUserSettings," localUsername ",this.localUsername)
    const jsonUserSettingsJS = JSON.parse(jsonUserSettings);
    let styles:any={}, complaintHeadings:any={} 
    if(jsonUserSettingsJS?.styles) styles = jsonUserSettingsJS.styles;
    if(jsonUserSettingsJS?.complaintHeadings) complaintHeadings = jsonUserSettingsJS.complaintHeadings;
    
    if(styles && Object.keys(styles).length>0){
      for(let Key in initStyles){
    
        if(!styles[Key]) styles[Key]=initStyles[Key];
    }

    this.dataSubject.next({ styles, complaintHeadings});
  }else{
    this.setData(initStyles,complaintHeadings)
  }
  }

  setData(styles={}, complaintHeadings= {}): void {
    // Convert the data to a JSON string and store it in local storage
    const jsonString = JSON.stringify({ styles: styles , complaintHeadings: complaintHeadings });
    localStorage.setItem(this.localUsername, jsonString);


    // Update the data subject with the new value
    this.dataSubject.next({ styles, complaintHeadings});
  }
}
