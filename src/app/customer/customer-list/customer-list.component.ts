import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaymentModalComponent } from 'src/app/shared/payment-modal/payment-modal.component';
import { CustomerLedgerComponent } from '../customer-ledger/customer-ledger.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customers: any[] = [];
  searchTerm = '';

  // Pagination + summary
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  totalBalance = 0;
  loading = false;
  private searchTimer: any;

  constructor(private service: GenericService, private modal: NgbModal, private toast: ToastService) {}

  ngOnInit() { this.loadCustomers(); }

  loadCustomers() {
    this.loading = true;
    this.service.getPaged<any>('customer', { page: this.page, limit: this.limit, search: this.searchTerm }).subscribe({
      next: (res) => {
        this.customers = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.totalBalance = res.summary?.totalBalance || 0;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadCustomers(); }, 350);
  }

  onPageChange(p: number) { this.page = p; this.loadCustomers(); }

  openPayment(c: any) {
    const ref = this.modal.open(PaymentModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.type = 'customer';
    ref.componentInstance.entityId = c._id;
    ref.componentInstance.entityName = c.name;
    ref.componentInstance.balanceDue = c.balance || 0;
    ref.result.then(r => { if (r === 'saved') this.loadCustomers(); }, () => {});
  }

  openLedger(c: any) {
    const ref = this.modal.open(CustomerLedgerComponent, { size: 'xl', backdrop: 'static', scrollable: true });
    ref.componentInstance.customerId = c._id;
    ref.componentInstance.customerName = c.name;
    // Ledger ke andar transaction add ho sakta hai — modal band hone par list refresh karein
    ref.result.then(() => this.loadCustomers(), () => this.loadCustomers());
  }

  deleteCustomer(c: any) {
    if (!confirm(`Delete customer "${c.name}"? Their entire ledger will also be removed.`)) return;
    this.service.delete('customer', c._id).subscribe({
      next: () => { this.toast.success('Customer deleted successfully'); this.loadCustomers(); },
      error: (err) => this.toast.error(err.error?.msg || 'Delete failed')
    });
  }
}
