// import { ApplicationRef, ChangeDetectorRef, ComponentFactoryResolver, ComponentRef, createComponent, ElementRef, EnvironmentInjector, Injectable, ReflectiveInjector, ViewContainerRef } from '@angular/core';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { Modal } from 'bootstrap';
// import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
// import { SelectTechnicianComponent } from '../../shared/popup/select-technician/select-technician.component';
// import {ErrorMessageComponent } from '../../shared/popup/error-message/error-message.component'
// import {SucessMessagesComponent } from '../../shared/popup/sucess-messages/sucess-messages.component'
// import { FeedbackComponent } from 'src/app/shared/popup/feedback/feedback.component';
// import { ViewPasswordComponent } from 'src/app/shared/popup/view-password/view-password.component';

// import { RedoPopupComponent } from 'src/app/shared/popup/redo-popup/redo-popup.component';
// import { ImageViewComponent } from 'src/app/shared/popup/image-view/image-view.component';
// import { SettingComponent } from 'src/app/shared/popup/setting/setting.component';

// @Injectable({
//   providedIn: 'root'
// })
// export class PopupService {

//   private technician$ = new BehaviorSubject<any>({});
//   selectedTechnician$ = this.technician$.asObservable();

//   private complaint$ = new BehaviorSubject<any>({});
//   selectedComplaint$ = this.complaint$.asObservable();

//   private feedBack$ = new BehaviorSubject<any>({});
//   selectedFeedBack$ = this.feedBack$.asObservable();


//   invoices: any;



//   constructor(private appRef: ApplicationRef, private modalService: NgbModal,
//     private injector: EnvironmentInjector) {}
  

//   openModal( view: any,message,selectedComplaints?) {

    
//     if(view?.sucess){
//         const modalRef = this.modalService.open(SucessMessagesComponent);
//         modalRef.componentInstance.message = message;
//         this.closeModel(modalRef)
      
//   }else  if(view?.error){
//         const modalRef = this.modalService.open(ErrorMessageComponent);
//         modalRef.componentInstance.message = message;
//         this.closeModel(modalRef)
//   }else if(view?.technician){
//     const modalRef = this.modalService.open(SelectTechnicianComponent);
//     modalRef.componentInstance.techList = message;
//     modalRef.componentInstance.selectedComplaints = selectedComplaints;
//     this.closeModel(modalRef)
//   }else  if(view?.feedback){
//     const modalRef = this.modalService.open(FeedbackComponent);
//     modalRef.componentInstance.message = message;
//     this.closeModel(modalRef,'feedback')
//   } else if(view?.viewPassword){
//     const modalRef = this.modalService.open(ViewPasswordComponent);
//     modalRef.componentInstance.message = message;
//     this.closeModel(modalRef)
//     this.closeModel(modalRef)
//   }else if(view?.redo){
//     const modalRef = this.modalService.open(RedoPopupComponent);
//     modalRef.componentInstance.message = message;
//     this.closeModel(modalRef)
//   }else if(view?.image){
//     const modalRef = this.modalService.open(ImageViewComponent);
//     modalRef.componentInstance.image = message;
//     this.closeModel(modalRef)
//   }else if(view?.setting){
//     const modalRef = this.modalService.open(SettingComponent);
//     modalRef.componentInstance.image = message;
//     this.closeModel(modalRef)
//   }

//   }
 
  
//  closeModel(modalRef,componenet?){
//   modalRef.result.then((result) => {
//     if(componenet == 'feedback'){
//       this.feedBack$.next(result);

//     // The modal has been closed
//     console.log('Modal closed with result:', result);
//     }


//   }).catch((reason) => {
//     // The modal was dismissed (closed without selecting a result)
//     console.log('Modal dismissed with reason:', reason);
//   });
//  }

//  setTechId(userId: any) {
//   this.technician$.next(userId);
// }
  
// }
