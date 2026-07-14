import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'app-repair-report',
  templateUrl: './repair-report.component.html'
})
export class RepairReportComponent implements OnInit {
  repairs: any[] = []; // current page rows
  fromDate = '';
  toDate = '';
  searchTerm = '';
  status = '';

  // Pagination + summary (summary covers ALL filtered records, not just the page)
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  counts: any = { all: 0, pending: 0, inProgress: 0, completed: 0, delivered: 0 };
  totalCost = 0;
  totalReceived = 0;
  totalDue = 0;
  private searchTimer: any;

  constructor(private service: GenericService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    const params: any = {
      from: this.fromDate, to: this.toDate, search: this.searchTerm,
      page: this.page, limit: this.limit
    };
    if (this.status) params.status = this.status;

    this.service.getPaged<any>('repair', params).subscribe({
      next: (res) => {
        this.repairs = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.counts = res.summary || this.counts;
        this.totalCost = res.summary?.totalCost || 0;
        this.totalReceived = res.summary?.totalReceived || 0;
        this.totalDue = res.summary?.totalDue || 0;
      },
      error: (err) => console.error(err)
    });
  }

  applyFilter(): void { this.page = 1; this.loadReport(); }

  onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadReport(); }, 350);
  }

  onPageChange(p: number): void { this.page = p; this.loadReport(); }

  setQuickRange(range: 'today' | 'week' | 'month' | 'all'): void {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    if (range === 'all') { this.fromDate = ''; this.toDate = ''; }
    else if (range === 'today') { this.fromDate = fmt(today); this.toDate = fmt(today); }
    else if (range === 'week') { const w = new Date(); w.setDate(w.getDate() - 6); this.fromDate = fmt(w); this.toDate = fmt(today); }
    else if (range === 'month') { this.fromDate = fmt(new Date(today.getFullYear(), today.getMonth(), 1)); this.toDate = fmt(today); }
    this.applyFilter();
  }

  balanceDue(r: any): number {
    return Math.max(0, (r.totalCost || 0) - (r.amountReceived || 0));
  }
}
