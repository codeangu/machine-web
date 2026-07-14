import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-repair-payment-modal',
  template: `
<div class="modal-header border-bottom py-3">
  <div>
    <h5 class="modal-title fw-bold mb-0"><i class="bi bi-cash-coin me-2"></i>Receive Payment</h5>
    <p class="text-muted small mb-0">{{ repairCode }} &middot; {{ productName }}</p>
  </div>
  <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
</div>

<div class="modal-body p-4">
  <div class="alert alert-light border d-flex justify-content-between align-items-center mb-4 py-2">
    <div>
      <span class="text-muted small">Total Cost</span>
      <span class="fw-bold ms-2">Rs. {{totalCost | number:'1.0-0'}}</span>
    </div>
    <div class="text-end">
      <span class="text-muted small">Balance Due</span>
      <span class="fw-bold ms-2" [class.text-danger]="balanceDue>0" [class.text-success]="balanceDue<=0">
        Rs. {{balanceDue | number:'1.0-0'}}
      </span>
    </div>
  </div>

  <div class="row g-3">
    <div class="col-12 col-md-6">
      <label class="form-label fw-semibold small">Amount (Rs.) <span class="text-danger">*</span></label>
      <div class="input-group">
        <span class="input-group-text">Rs.</span>
        <input type="number" class="form-control" [(ngModel)]="amount" placeholder="0" min="1" [attr.max]="balanceDue > 0 ? balanceDue : null">
      </div>
      <div class="form-text text-danger" *ngIf="balanceDue > 0">Max: Rs. {{balanceDue | number:'1.0-0'}}</div>
    </div>
    <div class="col-12 col-md-6">
      <label class="form-label fw-semibold small">Date</label>
      <input type="date" class="form-control" [(ngModel)]="date">
    </div>
    <div class="col-12">
      <label class="form-label fw-semibold small">Note (Optional)</label>
      <input type="text" class="form-control" [(ngModel)]="note" placeholder="e.g. Cash / Bank transfer">
    </div>
  </div>

  <div class="alert alert-danger mt-3 py-2 small" *ngIf="errorMsg">{{errorMsg}}</div>
</div>

<div class="modal-footer border-top py-3">
  <button class="btn btn-outline-secondary px-4" (click)="modal.dismiss()">Cancel</button>
  <button class="btn btn-success px-4 fw-semibold" (click)="submit()" [disabled]="loading || !amount || amount <= 0">
    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
    <i *ngIf="!loading" class="bi bi-check2 me-2"></i>
    Record Payment
  </button>
</div>
  `
})
export class RepairPaymentModalComponent {
  @Input() repairId!: string;
  @Input() repairCode = '';
  @Input() productName = '';
  @Input() totalCost = 0;
  @Input() balanceDue = 0;

  amount: number | null = null;
  note = '';
  date = new Date().toISOString().substring(0, 10);
  loading = false;
  errorMsg = '';

  constructor(public modal: NgbActiveModal, private http: HttpClient) {}

  submit() {
    if (!this.amount || this.amount <= 0) { this.errorMsg = 'Amount is required'; return; }
    this.errorMsg = '';
    this.loading = true;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`${environment.baseURL}/repair/${this.repairId}/payment`, {
      amount: this.amount,
      note: this.note,
      date: this.date
    }, { headers }).subscribe({
      next: () => { this.loading = false; this.modal.close('saved'); },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.msg || 'Error recording payment'; }
    });
  }
}
