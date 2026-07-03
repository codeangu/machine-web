import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, createComponent, ElementRef, EnvironmentInjector, Injectable,  ViewContainerRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

// import { ErrorMessageComponent } from 'src/app/shared/popup/error-message/error-message.component';
import { SucessMessagesComponent } from '../sucess-messages/sucess-messages.component';
import { ErrorMessagesComponent } from '../error-messages/error-messages.component';
import { AddEditProductComponent } from '../shared/popup/add-edit-product/add-edit-product.component';




@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private technician$ = new BehaviorSubject<any>({});
  selectedTechnician$ = this.technician$.asObservable();

  private feedBack$ = new BehaviorSubject<any>({});
  selectedFeedBack$ = this.feedBack$.asObservable();

  invoices: any;

  private modalResultSubject = new Subject<any>();

  constructor(private modalService: NgbModal) {}
  
    openModal( view: any,message:any,selectedComplaints?:any) {
      let modalRef;
    
      if(view?.success){
           modalRef = this.modalService.open(SucessMessagesComponent);
          modalRef.componentInstance.message = message;
        
       }else  if(view?.error){
           modalRef = this.modalService.open(ErrorMessagesComponent);
          modalRef.componentInstance.message = message;
       }else  if(view?.feedback){
    //   modalRef = this.modalService.open(FeedbackComponent,{size:'lg'});
    //  modalRef.componentInstance.message = message;
   
    }else  if(view?.addProduct){
      modalRef = this.modalService.open(AddEditProductComponent,{size:'xl'});
     modalRef.componentInstance.message = message;
   
    }
    if (modalRef) {
   

      modalRef.result.then(
        (result) => this.modalResultSubject.next({ view: view,type: 'result',  data: result }),
        (reason) => this.modalResultSubject.next({ view: view,type: 'dismissed',  data: reason })
      );

      return this.modalResultSubject.asObservable();
    }
      // Return an observable that completes immediately if no modal is opened
      return new Observable();
    }
   


 setTechId(userId: any) {
    this.technician$.next(userId);
  }
  
 

    
}
