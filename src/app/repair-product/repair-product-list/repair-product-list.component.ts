import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RepairPaymentModalComponent } from '../repair-payment-modal/repair-payment-modal.component';

@Component({
  selector: 'app-repair-product-list',
  templateUrl: './repair-product-list.component.html'
})
export class RepairProductListComponent implements OnInit {
  searchTerm = '';
  activeStatus = 'All';
  repairs: any[] = [];
  loading = false;

  // Pagination + status counts
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  counts: any = { all: 0, pending: 0, inProgress: 0, completed: 0, delivered: 0 };
  private searchTimer: any;

  constructor(
    private genericService: GenericService,
    private router: Router,
    private toast: ToastService,
    private modal: NgbModal,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadRepairs();
  }

  loadRepairs(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.activeStatus !== 'All') params.status = this.activeStatus;
    if (this.searchTerm) params.search = this.searchTerm;

    this.genericService.getPaged<any>('repair', params).subscribe({
      next: (res) => {
        this.repairs = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.counts = res.summary || this.counts;
        this.loading = false;
      },
      error: (err) => { this.loading = false; console.error(err); }
    });
  }

  onStatusChange(status: string): void {
    this.activeStatus = status;
    this.page = 1;
    this.loadRepairs();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadRepairs(); }, 350);
  }

  onPageChange(p: number): void { this.page = p; this.loadRepairs(); }

  editRepair(r: any): void {
    this.router.navigate(['/repair-product/add'], { queryParams: { id: r._id } });
  }

  deleteRepair(r: any): void {
    if (!confirm(`Delete repair job "${r.repairCode}" for "${r.productName}"? This cannot be undone.`)) return;
    this.genericService.delete('repair', r._id).subscribe({
      next: () => { this.toast.success('Repair record deleted'); this.loadRepairs(); },
      error: (err) => this.toast.error(err.error?.msg || 'Delete failed')
    });
  }

  balanceDue(r: any): number {
    return Math.max(0, (r.totalCost || 0) - (r.amountReceived || 0));
  }

  openPaymentModal(r: any): void {
    const ref = this.modal.open(RepairPaymentModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.repairId = r._id;
    ref.componentInstance.repairCode = r.repairCode;
    ref.componentInstance.productName = r.productName;
    ref.componentInstance.totalCost = r.totalCost || 0;
    ref.componentInstance.balanceDue = this.balanceDue(r);
    ref.result.then((result) => {
      if (result === 'saved') { this.toast.success('Payment recorded'); this.loadRepairs(); }
    }, () => {});
  }

  updateStatus(r: any, status: string): void {
    if (status === r.status) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.patch(`${environment.baseURL}/repair/${r._id}/status`, { status }, { headers }).subscribe({
      next: () => { this.toast.success(`Marked as ${status}`); this.loadRepairs(); },
      error: (err) => this.toast.error(err.error?.msg || 'Status update failed')
    });
  }
}
