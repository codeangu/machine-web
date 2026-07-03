import { Component, OnInit } from '@angular/core';
import { GenericService } from 'src/app/services/generic.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentModalComponent } from 'src/app/shared/payment-modal/payment-modal.component';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html'
})
export class PurchaseListComponent implements OnInit {
  filteredPurchases: any[] = [];   // current page rows
  searchTerm = '';
  loading = false;
  fromDate = '';
  toDate = '';

  // Pagination + summary (summary covers ALL filtered records)
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  totalPurchases = 0;
  totalPaid = 0;
  totalDue = 0;
  private searchTimer: any;

  // Purchase return modal state
  returnPurchase: any = null;
  returnLines: any[] = [];
  returnReason = '';
  returnSaving = false;
  returnError = '';
  returnLoading = false;

  constructor(private service: GenericService, private modal: NgbModal, private toast: ToastService) {}

  ngOnInit() { this.loadPurchases(); }

  loadPurchases() {
    this.loading = true;
    this.service.getPaged<any>('purchase', {
      from: this.fromDate, to: this.toDate, search: this.searchTerm,
      page: this.page, limit: this.limit
    }).subscribe({
      next: (res) => {
        this.filteredPurchases = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.totalPurchases = res.summary?.totalPurchases || 0;
        this.totalPaid = res.summary?.totalPaid || 0;
        this.totalDue = res.summary?.totalDue || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() { this.page = 1; this.loadPurchases(); }

  onPageChange(p: number) { this.page = p; this.loadPurchases(); }

  setQuickRange(range: 'today' | 'week' | 'month' | 'all') {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    if (range === 'all') { this.fromDate = ''; this.toDate = ''; }
    else if (range === 'today') { this.fromDate = fmt(today); this.toDate = fmt(today); }
    else if (range === 'week') { const w = new Date(); w.setDate(w.getDate() - 6); this.fromDate = fmt(w); this.toDate = fmt(today); }
    else if (range === 'month') { this.fromDate = fmt(new Date(today.getFullYear(), today.getMonth(), 1)); this.toDate = fmt(today); }
    this.page = 1;
    this.loadPurchases();
  }

  exportPDF() {
    // Fetch ALL matching records (not just the current page) for a complete report
    this.service.getAllWithParams<any>('purchase', { from: this.fromDate, to: this.toDate, search: this.searchTerm }).subscribe({
      next: (all) => this.buildPurchasePdf(all || []),
      error: () => this.toast.error('Could not generate the report.')
    });
  }

  private buildPurchasePdf(allPurchases: any[]) {
    const sumPurchases = allPurchases.reduce((s, p) => s + (p.grandTotal || 0), 0);
    const sumPaid = allPurchases.reduce((s, p) => s + (p.amountPaid || 0), 0);
    const sumDue = sumPurchases - sumPaid;
    const rows = allPurchases.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(p.date).toLocaleDateString('en-GB')}</td>
        <td>${p.purchaseNumber}</td>
        <td>${p.supplier?.name || '—'} ${p.supplier?.companyName ? '(' + p.supplier.companyName + ')' : ''}</td>
        <td style="text-align:right">Rs. ${(p.grandTotal || 0).toLocaleString()}</td>
        <td style="text-align:right;color:#16a34a">Rs. ${(p.amountPaid || 0).toLocaleString()}</td>
        <td style="text-align:right;color:#e11d48">Rs. ${this.getBalanceDue(p).toLocaleString()}</td>
      </tr>`).join('');
    const range = (this.fromDate || this.toDate) ? `${this.fromDate || 'Start'} → ${this.toDate || 'Today'}` : 'All Time';
    const win = window.open('', '_blank', 'width=950,height=700');
    win?.document.write(`
      <html><head><title>Purchase Report</title>
      <style>
        body{font-family:'Segoe UI',sans-serif;color:#1e293b;padding:24px}
        .brand{display:flex;justify-content:space-between;border-bottom:3px solid #312e81;padding-bottom:12px;margin-bottom:14px}
        .brand h2{margin:0;font-weight:800} .y{color:#f59e0b}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#1e293b;color:#fff;padding:8px;text-align:left;font-size:11px;text-transform:uppercase}
        td{padding:7px 8px;border-bottom:1px solid #e2e8f0}
        tfoot td{font-weight:700;border-top:2px solid #1e293b}
        @media print{body{margin:8mm}}
      </style></head><body>
      <div class="brand">
        <div><h2>MACHINE<span class="y">MANAGEMENT</span></h2>
          <div style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase">Industrial Systems &amp; Machinery</div></div>
        <div style="text-align:right"><div style="font-weight:700;font-size:15px">Purchase Report</div>
          <div style="color:#64748b">Period: ${range}</div>
          <div style="color:#64748b">Generated: ${new Date().toLocaleDateString('en-GB')}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Date</th><th>Invoice</th><th>Supplier</th>
        <th style="text-align:right">Grand Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance Due</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4">Totals (${allPurchases.length} records)</td>
        <td style="text-align:right">Rs. ${sumPurchases.toLocaleString()}</td>
        <td style="text-align:right;color:#16a34a">Rs. ${sumPaid.toLocaleString()}</td>
        <td style="text-align:right;color:#e11d48">Rs. ${sumDue.toLocaleString()}</td></tr></tfoot>
      </table></body></html>`);
    win?.document.close();
    setTimeout(() => win?.print(), 600);
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadPurchases(); }, 350);
  }

  getBalanceDue(p: any): number {
    return Math.max(0, (p.grandTotal || 0) - (p.amountPaid || 0));
  }

  getStatus(p: any): string {
    const due = this.getBalanceDue(p);
    if (due <= 0) return 'paid';
    if ((p.amountPaid || 0) > 0) return 'partial';
    return 'unpaid';
  }

  openPayment(p: any) {
    const ref = this.modal.open(PaymentModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.type = 'supplier';
    ref.componentInstance.entityId = p.supplier?._id;
    ref.componentInstance.entityName = `${p.supplier?.name} (${p.supplier?.companyName})`;
    ref.componentInstance.invoiceNumber = p.purchaseNumber;
    ref.componentInstance.balanceDue = this.getBalanceDue(p);
    ref.result.then(r => { if (r === 'saved') this.loadPurchases(); }, () => {});
  }

  deletePurchase(id: string) {
    if (confirm('Are you sure you want to cancel this purchase? The stock will be reduced accordingly.')) {
      this.service.delete('purchase', id).subscribe({
        next: () => { this.toast.success('Purchase canceled and stock adjusted'); this.loadPurchases(); },
        error: (err) => this.toast.error(err.error?.msg || 'Error canceling purchase')
      });
    }
  }

  // ---------- Purchase Return ----------
  openReturn(p: any) {
    this.returnPurchase = { _id: p._id, purchaseNumber: p.purchaseNumber };
    this.returnLines = [];
    this.returnReason = '';
    this.returnError = '';
    this.returnLoading = true;
    this.service.getById<any>('purchase', p._id).subscribe({
      next: (pur) => {
        this.service.getById<any>('purchase-return/purchase', p._id).subscribe({
          next: (ret: any) => { this.buildReturnLines(pur, ret.returnedByProduct || {}); this.returnLoading = false; },
          error: () => { this.buildReturnLines(pur, {}); this.returnLoading = false; }
        });
      },
      error: () => { this.returnError = 'Failed to load purchase details.'; this.returnLoading = false; }
    });
  }

  private buildReturnLines(pur: any, returnedByProduct: any) {
    this.returnPurchase.supplierName = pur.supplier?.name || 'Supplier';
    this.returnLines = (pur.items || []).map((it: any) => {
      const pid = it.product?._id || it.product;
      const already = returnedByProduct[pid] || 0;
      const maxReturn = it.quantity - already;
      return {
        productId: pid,
        productName: it.product?.productName || 'Product',
        purchasedQty: it.quantity,
        alreadyReturned: already,
        maxReturn,
        purchasePrice: it.purchasePrice,
        returnQty: 0
      };
    });
  }

  returnLineTotal(line: any): number {
    return (Number(line.returnQty) || 0) * (line.purchasePrice || 0);
  }

  get returnTotal(): number {
    return this.returnLines.reduce((s, l) => s + this.returnLineTotal(l), 0);
  }

  closeReturn() { this.returnPurchase = null; this.returnError = ''; }

  submitReturn() {
    this.returnError = '';
    const items = this.returnLines
      .filter(l => Number(l.returnQty) > 0)
      .map(l => ({ productId: l.productId, productName: l.productName, quantity: Number(l.returnQty) }));

    if (items.length === 0) { this.returnError = 'Enter a return quantity for at least one item.'; return; }
    for (const l of this.returnLines) {
      if (Number(l.returnQty) > l.maxReturn) {
        this.returnError = `"${l.productName}" — max returnable is ${l.maxReturn}.`;
        return;
      }
    }

    this.returnSaving = true;
    this.service.create<any>('purchase-return', {
      purchaseId: this.returnPurchase._id,
      items,
      reason: this.returnReason?.trim()
    }).subscribe({
      next: () => { this.returnSaving = false; this.toast.success('Purchase return processed successfully'); this.closeReturn(); this.loadPurchases(); },
      error: (err) => { this.returnSaving = false; this.returnError = err.error?.msg || 'Failed to record return.'; }
    });
  }

}
