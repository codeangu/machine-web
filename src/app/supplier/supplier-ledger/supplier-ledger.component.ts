import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericService } from '../../services/generic.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-supplier-ledger',
  templateUrl: './supplier-ledger.component.html'
})
export class SupplierLedgerComponent implements OnInit {
  @Input() supplierId: any;
  @Input() supplierName: any;

  ledgerData: any = null;
  loading = true;

  // Client-side pagination for fast rendering of long ledgers
  ledgerPage = 1;
  ledgerLimit = 15;

  // Transaction form
  showTxForm = false;
  txType: 'Payment' | 'Purchase' = 'Payment';
  txAmount: number | null = null;
  txMethod = 'Cash';
  txNote = '';
  txDate = new Date().toISOString().substring(0, 10);
  txLoading = false;
  txError = '';

  constructor(
    public activeModal: NgbActiveModal,
    private genericService: GenericService,
    private http: HttpClient
  ) {}

  ngOnInit(): void { this.fetchLedger(); }

  fetchLedger() {
    this.loading = true;
    this.genericService.getById<any>('supplier/ledger', this.supplierId).subscribe({
      next: (res) => { this.ledgerData = res; this.ledgerPage = 1; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get ledgerRows(): any[] { return this.ledgerData?.ledger || []; }
  get ledgerTotalPages(): number { return Math.max(1, Math.ceil(this.ledgerRows.length / this.ledgerLimit)); }
  get pagedLedger(): any[] {
    const start = (this.ledgerPage - 1) * this.ledgerLimit;
    return this.ledgerRows.slice(start, start + this.ledgerLimit);
  }
  onLedgerPage(p: number) { this.ledgerPage = p; }

  submitTransaction() {
    if (!this.txAmount || this.txAmount <= 0) { this.txError = 'Amount is required'; return; }
    this.txError = '';
    this.txLoading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`${environment.baseURL}/supplier/payment`, {
      supplierId: this.supplierId,
      amount: this.txAmount,
      transactionType: this.txType,
      paymentMethod: this.txMethod,
      note: this.txNote,
      date: this.txDate
    }, { headers }).subscribe({
      next: () => {
        this.txLoading = false;
        this.showTxForm = false;
        this.txAmount = null;
        this.txNote = '';
        this.fetchLedger();
      },
      error: (err) => {
        this.txLoading = false;
        this.txError = err.error?.msg || 'Transaction failed';
      }
    });
  }

  // Build the FULL ledger table from data so print always includes every row
  // (the on-screen table is paginated for speed).
  private buildPrintTable(): string {
    const s = this.ledgerData?.summary || {};
    const rows = (this.ledgerData?.ledger || []).map((e: any, i: number) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(e.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
        <td>${e.transactionType || ''}${e.description ? ' — ' + e.description : ''}</td>
        <td style="text-align:right;color:#e11d48">${e.credit > 0 ? 'Rs. ' + e.credit.toLocaleString() : '—'}</td>
        <td style="text-align:right;color:#16a34a">${e.debit > 0 ? 'Rs. ' + e.debit.toLocaleString() : '—'}</td>
        <td style="text-align:right;font-weight:700">Rs. ${(e.runningBalance || 0).toLocaleString()}</td>
      </tr>`).join('');
    return `
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#e2e8f0;text-align:left">
            <th style="padding:6px">#</th><th style="padding:6px">Date</th><th style="padding:6px">Type &amp; Reference</th>
            <th style="padding:6px;text-align:right">Purchase Bill</th><th style="padding:6px;text-align:right">Payment Made</th>
            <th style="padding:6px;text-align:right">Balance Due</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6" style="padding:10px;text-align:center">No transactions found.</td></tr>'}</tbody>
        <tfoot>
          <tr style="background:#1e293b;color:#fff;font-weight:700">
            <td colspan="3" style="padding:6px;text-align:right">Totals:</td>
            <td style="padding:6px;text-align:right">Rs. ${(s.totalPurchases || 0).toLocaleString()}</td>
            <td style="padding:6px;text-align:right">Rs. ${(s.totalPaid || 0).toLocaleString()}</td>
            <td style="padding:6px;text-align:right">Rs. ${(s.balanceDue || 0).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>`;
  }

  printLedger() {
    const content = this.buildPrintTable();
    const s = this.ledgerData?.summary || {};
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const win = window.open('', '_blank', 'width=900,height=700');
    win?.document.write(`
      <html><head><title>Supplier Ledger — ${this.supplierName}</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
      <style>
        @media print { body { margin: 8mm; } }
        body { padding: 24px; font-size: 13px; font-family: 'Segoe UI', sans-serif; color:#1e293b; }
        .brand { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #312e81; padding-bottom:12px; margin-bottom:16px; }
        .brand h2 { margin:0; font-weight:800; letter-spacing:-.5px; } .brand .y { color:#f59e0b; }
        .sum { display:flex; gap:10px; margin:14px 0 18px; }
        .sum div { flex:1; border:1px solid #e2e8f0; border-radius:10px; padding:10px 14px; }
        .sum small { color:#64748b; text-transform:uppercase; font-size:10px; font-weight:700; letter-spacing:.5px; }
        .sum b { display:block; font-size:18px; margin-top:2px; }
      </style>
      </head><body>
        <div class="brand">
          <div><h2>MACHINE<span class="y">MANAGEMENT</span></h2>
            <div style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px">Industrial Systems &amp; Machinery</div></div>
          <div style="text-align:right">
            <div style="font-weight:700;font-size:15px">Supplier Account Statement</div>
            <div style="color:#64748b">Generated: ${today}</div>
          </div>
        </div>
        <div><b style="font-size:15px">${this.supplierName}</b></div>
        <div class="sum">
          <div><small>Total Purchases</small><b>Rs. ${(s.totalPurchases||0).toLocaleString()}</b></div>
          <div><small>Total Paid</small><b style="color:#16a34a">Rs. ${(s.totalPaid||0).toLocaleString()}</b></div>
          <div><small>Balance Due</small><b style="color:#e11d48">Rs. ${(s.balanceDue||0).toLocaleString()}</b></div>
        </div>
        ${content}
      </body></html>`);
    win?.document.close();
    setTimeout(() => win?.print(), 800);
  }
}
