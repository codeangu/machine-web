import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss']
})
export class ErrorMessagesComponent {
  @Input() message: any;
  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit(): void {

  }
    ngOnDestroy(){
    
    }
}
