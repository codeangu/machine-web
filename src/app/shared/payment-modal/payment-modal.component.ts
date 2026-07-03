import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-modal',
  template: `
<div class="modal-header border-bottom py-3">
  <div>
    <h5 class="modal-title fw-bold mb-0">
      <i class="bi me-2"
        [class.bi-cash-coin]="txType==='payment'"
        [class.bi-plus-circle]="txType==='credit'"></i>
      {{ type === 'customer'
          ? (txType === 'payment' ? 'Receive Payment' : 'Credit Sale (On Account)')
          : (txType === 'payment' ? 'Make Payment to Supplier' : 'Credit Purchase (On Account)') }}
    </h5>
    <p class="text-muted small mb-0">{{ entityName }}</p>
  </div>
  <button type="button" class="btn-close" (click)="modal.dismiss()"></button>
</div>

<div class="modal-body p-4">

  <!-- Transaction Type Selector -->
  <div class="row g-2 mb-4">
    <div class="col-6">
      <button class="btn w-100 py-3 fw-semibold"
        [class.btn-success]="txType==='payment'"
        [class.btn-outline-secondary]="txType!=='payment'"
        (click)="txType='payment'">
        <i class="bi me-2" [class.bi-cash-coin]="type==='customer'" [class.bi-send]="type==='supplier'"></i>
        <div>{{ type === 'customer' ? 'Payment Received' : 'Payment Made' }}</div>
        <small class="opacity-75 fw-normal">Balance decreases</small>
      </button>
    </div>
    <div class="col-6">
      <button class="btn w-100 py-3 fw-semibold"
        [class.btn-warning]="txType==='credit'"
        [class.btn-outline-secondary]="txType!=='credit'">
        <div (click)="txType='credit'">
          <i class="bi bi-plus-circle me-2"></i>
          <div>{{ type === 'customer' ? 'Credit Sale' : 'Credit Purchase' }}</div>
          <small class="opacity-75 fw-normal">Balance increases (on account)</small>
        </div>
      </button>
    </div>
  </div>

  <!-- Info Box -->
  <div class="alert py-2 mb-4 small"
    [class.alert-success]="txType==='payment'"
    [class.alert-warning]="txType==='credit'">
    <i class="bi me-2"
      [class.bi-info-circle]="txType==='payment'"
      [class.bi-exclamation-triangle]="txType==='credit'"></i>
    <span *ngIf="txType==='payment' && type==='customer'">
      Customer made a payment — balance will decrease
    </span>
    <span *ngIf="txType==='payment' && type==='supplier'">
      You paid the supplier — supplier balance will decrease
    </span>
    <span *ngIf="txType==='credit' && type==='customer'">
      Goods sold on credit — customer balance will increase
    </span>
    <span *ngIf="txType==='credit' && type==='supplier'">
      Goods received on credit — supplier balance will increase
    </span>
  </div>

  <!-- Invoice Info -->
  <div class="alert alert-light border d-flex justify-content-between align-items-center mb-4 py-2" *ngIf="invoiceNumber">
    <div>
      <span class="text-muted small">Invoice #</span>
      <span class="fw-bold ms-2">{{invoiceNumber}}</span>
    </div>
    <div class="text-end">
      <span class="text-muted small">Current Balance</span>
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
        <input type="number" class="form-control" [(ngModel)]="amount" placeholder="0" min="1"
          [attr.max]="txType==='payment' && balanceDue > 0 ? balanceDue : null">
      </div>
      <div class="form-text text-danger" *ngIf="txType==='payment' && balanceDue > 0">
        Max: Rs. {{balanceDue | number:'1.0-0'}}
      </div>
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label fw-semibold small">Method</label>
      <select class="form-select" [(ngModel)]="method">
        <option value="Cash">Cash</option>
        <option value="Bank">Bank Transfer</option>
        <option value="Cheque">Cheque</option>
        <option value="Online">Online</option>
      </select>
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label fw-semibold small">Date</label>
      <input type="date" class="form-control" [(ngModel)]="date">
    </div>

    <div class="col-12 col-md-6">
      <label class="form-label fw-semibold small">Note (Optional)</label>
      <input type="text" class="form-control" [(ngModel)]="note"
        [placeholder]="txType==='payment' ? 'e.g. Cash payment against Invoice #5' : 'e.g. Goods received — Invoice #7'">
    </div>
  </div>

  <div class="alert alert-danger mt-3 py-2 small" *ngIf="errorMsg">{{errorMsg}}</div>
</div>

<div class="modal-footer border-top py-3">
  <button class="btn btn-outline-secondary px-4" (click)="modal.dismiss()">Cancel</button>
  <button class="btn px-4 fw-semibold" (click)="submit()" [disabled]="loading || !amount || amount <= 0"
    [class.btn-success]="txType==='payment'"
    [class.btn-warning]="txType==='credit'">
    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
    <i *ngIf="!loading" class="bi me-2"
      [class.bi-check2]="txType==='payment'"
      [class.bi-plus-circle]="txType==='credit'"></i>
    {{ txType === 'payment'
        ? 'Record Payment'
        : (type === 'customer' ? 'Add Credit Sale' : 'Add Credit Purchase') }}
  </button>
</div>
  `
})
export class PaymentModalComponent {
  @Input() type: 'customer' | 'supplier' = 'customer';
  @Input() entityId!: string;
  @Input() entityName = '';
  @Input() invoiceNumber = '';
  @Input() balanceDue = 0;
  @Input() saleId: string | null = null;

  txType: 'payment' | 'credit' = 'payment';
  amount: number | null = null;
  method = 'Cash';
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

    // Payment against a specific sale invoice — must update that sale's
    // amountReceived too, not just the customer's overall ledger balance.
    if (this.type === 'customer' && this.txType === 'payment' && this.saleId) {
      const url = `${environment.baseURL}/sale/${this.saleId}/payment`;
      const body = {
        amount: this.amount,
        note: `${this.method} — ${this.note || this.invoiceNumber || ''}`.trim().replace(/— $/, ''),
        date: this.date
      };
      this.http.post(url, body, { headers }).subscribe({
        next: () => { this.loading = false; this.modal.close('saved'); },
        error: (err) => { this.loading = false; this.errorMsg = err.error?.msg || 'Error recording transaction'; }
      });
      return;
    }

    const url = this.type === 'customer'
      ? `${environment.baseURL}/customer/payment`
      : `${environment.baseURL}/supplier/payment`;

    const transactionType = this.txType === 'payment'
      ? 'Payment'
      : (this.type === 'customer' ? 'Sale' : 'Purchase');

    const body = this.type === 'customer'
      ? {
          customerId: this.entityId,
          amount: this.amount,
          transactionType,
          note: `${this.method} — ${this.note || this.invoiceNumber || ''}`.trim().replace(/— $/, ''),
          date: this.date
        }
      : {
          supplierId: this.entityId,
          amount: this.amount,
          transactionType,
          paymentMethod: this.method,
          note: this.note || this.invoiceNumber || '',
          date: this.date
        };

    this.http.post(url, body, { headers }).subscribe({
      next: () => { this.loading = false; this.modal.close('saved'); },
      error: (err) => { this.loading = false; this.errorMsg = err.error?.msg || 'Error recording transaction'; }
    });
  }
}
