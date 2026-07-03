import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PopupService } from '../services/popup.service';

@Component({
  selector: 'app-sucess-messages',
  templateUrl: './sucess-messages.component.html',
  styleUrls: ['./sucess-messages.component.scss']
})
export class SucessMessagesComponent implements OnInit {
  @Input() message: any;

  constructor(public activeModal: NgbActiveModal , private pouppService:PopupService ) {}

  ngOnInit() {
    console.log('SucessMessagesComponent message:', this.message); 
  
  }
}

