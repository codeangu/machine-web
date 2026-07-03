import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GenericService } from 'src/app/services/generic.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentModalComponent } from 'src/app/shared/payment-modal/payment-modal.component';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-sale-list',
  templateUrl: './sale-list.component.html'
})
export class SaleListComponent implements OnInit {
  filteredSales: any[] = [];   // current page rows
  searchTerm = '';
  fromDate = '';
  toDate = '';

  // Pagination + summary (summary covers ALL filtered records, not just the page)
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  totalSales = 0;
  totalReceived = 0;
  totalDue = 0;
  private searchTimer: any;

  // Sale return modal state
  returnSale: any = null;
  returnLines: any[] = [];
  returnReason = '';
  returnSaving = false;
  returnError = '';
  returnLoading = false;

  constructor(private service: GenericService, private router: Router, private modal: NgbModal, private toast: ToastService) {}

  ngOnInit() { this.loadSales(); }

  loadSales() {
    this.service.getPaged<any>('sale', {
      from: this.fromDate, to: this.toDate, search: this.searchTerm,
      page: this.page, limit: this.limit
    }).subscribe({
      next: (res) => {
        this.filteredSales = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.totalSales = res.summary?.totalSales || 0;
        this.totalReceived = res.summary?.totalReceived || 0;
        this.totalDue = res.summary?.totalDue || 0;
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter() { this.page = 1; this.loadSales(); }

  onPageChange(p: number) { this.page = p; this.loadSales(); }

  setQuickRange(range: 'today' | 'week' | 'month' | 'all') {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    if (range === 'all') { this.fromDate = ''; this.toDate = ''; }
    else if (range === 'today') { this.fromDate = fmt(today); this.toDate = fmt(today); }
    else if (range === 'week') { const w = new Date(); w.setDate(w.getDate() - 6); this.fromDate = fmt(w); this.toDate = fmt(today); }
    else if (range === 'month') { this.fromDate = fmt(new Date(today.getFullYear(), today.getMonth(), 1)); this.toDate = fmt(today); }
    this.page = 1;
    this.loadSales();
  }

  deleteSale(s: any) {
    if (!confirm(`Delete Sale #${s.invoiceNumber}? The stock will be restored and the customer ledger will be adjusted.`)) return;
    this.service.delete('sale', s._id).subscribe({
      next: () => { this.toast.success('Sale deleted and stock/ledger adjusted'); this.loadSales(); },
      error: (err) => this.toast.error(err.error?.msg || 'Delete failed')
    });
  }

  exportPDF() {
    // Fetch ALL matching records (not just the current page) for a complete report
    this.service.getAllWithParams<any>('sale', { from: this.fromDate, to: this.toDate, search: this.searchTerm }).subscribe({
      next: (all) => this.buildSalesPdf(all || []),
      error: () => this.toast.error('Could not generate the report.')
    });
  }

  private buildSalesPdf(allSales: any[]) {
    const sumSales = allSales.reduce((s, x) => s + (x.grandTotal || 0), 0);
    const sumReceived = allSales.reduce((s, x) => s + (x.amountReceived || 0), 0);
    const sumDue = sumSales - sumReceived;
    const rows = allSales.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(s.date).toLocaleDateString('en-GB')}</td>
        <td>${s.invoiceNumber}</td>
        <td>${s.customer?.name || s.customerName || 'Walking Customer'}</td>
        <td style="text-align:right">Rs. ${(s.grandTotal || 0).toLocaleString()}</td>
        <td style="text-align:right;color:#16a34a">Rs. ${(s.amountReceived || 0).toLocaleString()}</td>
        <td style="text-align:right;color:#e11d48">Rs. ${this.getBalanceDue(s).toLocaleString()}</td>
      </tr>`).join('');
    const range = (this.fromDate || this.toDate) ? `${this.fromDate || 'Start'} → ${this.toDate || 'Today'}` : 'All Time';
    const win = window.open('', '_blank', 'width=950,height=700');
    win?.document.write(`
      <html><head><title>Sales Report</title>
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
        <div style="text-align:right"><div style="font-weight:700;font-size:15px">Sales Report</div>
          <div style="color:#64748b">Period: ${range}</div>
          <div style="color:#64748b">Generated: ${new Date().toLocaleDateString('en-GB')}</div></div>
      </div>
      <table><thead><tr><th>#</th><th>Date</th><th>Invoice</th><th>Customer</th>
        <th style="text-align:right">Grand Total</th><th style="text-align:right">Received</th><th style="text-align:right">Balance Due</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="4">Totals (${allSales.length} records)</td>
        <td style="text-align:right">Rs. ${sumSales.toLocaleString()}</td>
        <td style="text-align:right;color:#16a34a">Rs. ${sumReceived.toLocaleString()}</td>
        <td style="text-align:right;color:#e11d48">Rs. ${sumDue.toLocaleString()}</td></tr></tfoot>
      </table></body></html>`);
    win?.document.close();
    setTimeout(() => win?.print(), 600);
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadSales(); }, 350);
  }

  getBalanceDue(s: any): number {
    return Math.max(0, (s.grandTotal || 0) - (s.amountReceived || 0));
  }

  getStatus(s: any): string {
    const due = this.getBalanceDue(s);
    if (due <= 0) return 'paid';
    if ((s.amountReceived || 0) > 0) return 'partial';
    return 'unpaid';
  }

  openPayment(s: any) {
    if (this.getBalanceDue(s) <= 0) { this.toast.info('This invoice is already fully paid.'); return; }
    const ref = this.modal.open(PaymentModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.type = 'customer';
    ref.componentInstance.entityId = s.customer?._id || '';
    ref.componentInstance.entityName = s.customer?.name || s.customerName || 'Walking Customer';
    ref.componentInstance.invoiceNumber = s.invoiceNumber;
    ref.componentInstance.balanceDue = this.getBalanceDue(s);
    ref.componentInstance.saleId = s._id;
    ref.result.then(r => { if (r === 'saved') this.loadSales(); }, () => {});
  }

  editSale(id: string) { this.router.navigate(['/add-sale', id]); }

  // ---------- Sale Return ----------
  openReturn(s: any) {
    this.returnSale = { _id: s._id, invoiceNumber: s.invoiceNumber };
    this.returnLines = [];
    this.returnReason = '';
    this.returnError = '';
    this.returnLoading = true;
    // Fetch full sale (with product names) and prior returns in parallel
    this.service.getById<any>('sale', s._id).subscribe({
      next: (sale) => {
        this.service.getById<any>('sale-return/sale', s._id).subscribe({
          next: (ret: any) => { this.buildReturnLines(sale, ret.returnedByProduct || {}); this.returnLoading = false; },
          error: () => { this.buildReturnLines(sale, {}); this.returnLoading = false; }
        });
      },
      error: () => { this.returnError = 'Failed to load sale details.'; this.returnLoading = false; }
    });
  }

  private buildReturnLines(sale: any, returnedByProduct: any) {
    this.returnSale.customerName = sale.customer?.name || sale.customerName || 'Walking Customer';
    this.returnLines = (sale.items || []).map((it: any) => {
      const pid = it.product?._id || it.product;
      const already = returnedByProduct[pid] || 0;
      const maxReturn = it.quantity - already;
      return {
        productId: pid,
        productName: it.product?.productName || 'Product',
        soldQty: it.quantity,
        alreadyReturned: already,
        maxReturn,
        salePrice: it.salePrice,
        returnQty: 0
      };
    });
  }

  returnLineTotal(line: any): number {
    return (Number(line.returnQty) || 0) * (line.salePrice || 0);
  }

  get returnTotal(): number {
    return this.returnLines.reduce((s, l) => s + this.returnLineTotal(l), 0);
  }

  closeReturn() { this.returnSale = null; this.returnError = ''; }

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
    this.service.create<any>('sale-return', {
      saleId: this.returnSale._id,
      items,
      reason: this.returnReason?.trim()
    }).subscribe({
      next: () => { this.returnSaving = false; this.toast.success('Sale return processed successfully'); this.closeReturn(); this.loadSales(); },
      error: (err) => { this.returnSaving = false; this.returnError = err.error?.msg || 'Failed to record return.'; }
    });
  }

}
