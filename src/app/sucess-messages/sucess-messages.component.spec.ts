import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucessMessagesComponent } from './sucess-messages.component';

describe('SucessMessagesComponent', () => {
  let component: SucessMessagesComponent;
  let fixture: ComponentFixture<SucessMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SucessMessagesComponent]
    });
    fixture = TestBed.createComponent(SucessMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
