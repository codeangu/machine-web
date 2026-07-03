import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierLedgerComponent } from './supplier-ledger.component';

describe('SupplierLedgerComponent', () => {
  let component: SupplierLedgerComponent;
  let fixture: ComponentFixture<SupplierLedgerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierLedgerComponent]
    });
    fixture = TestBed.createComponent(SupplierLedgerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
