// src/app/supplier/supplier-list/supplier-list.component.ts
import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../services/generic.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddSupplierComponent } from '../add-supplier/add-supplier.component';
import { SupplierLedgerComponent } from '../supplier-ledger/supplier-ledger.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-supplier-list',
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.scss']
})
export class SupplierListComponent implements OnInit {
  suppliers: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  // Pagination + summary
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  totalBalance = 0;
  private searchTimer: any;

  constructor(private genericService: GenericService, private modalService: NgbModal, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.loading = true;
    this.genericService.getPaged<any>('supplier', { page: this.page, limit: this.limit, search: this.searchTerm }).subscribe({
      next: (res) => {
        this.suppliers = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.totalBalance = res.summary?.totalBalance || 0;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Search Logic (debounced, server-side)
  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.loadSuppliers(); }, 350);
  }

  onPageChange(p: number) { this.page = p; this.loadSuppliers(); }

  // Open Modal for Add Supplier
  openAddModal() {
    const modalRef = this.modalService.open(AddSupplierComponent, { size: 'lg', backdrop: 'static' });
    
    // Jab modal close ho aur data save ho jaye, to list refresh karein
    modalRef.result.then((result) => {
      if (result === 'saved') {
        this.loadSuppliers();
      }
    }, (reason) => {});
  }

  // supplier-list.component.ts mein yeh function add karein
openEditModal(supplier: any) {
  const modalRef = this.modalService.open(AddSupplierComponent, { size: 'lg', backdrop: 'static' });
  
  // Yeh line supplier ka data 'AddSupplierComponent' ko bhej degi
  modalRef.componentInstance.supplierData = supplier;

  modalRef.result.then((result) => {
    if (result === 'saved') {
      this.loadSuppliers(); // Save hone ke baad list refresh
    }
  });
}


deleteSupplier(supplier: any) {
  if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
  this.genericService.delete('supplier', supplier._id).subscribe({
    next: () => { this.toast.success('Supplier deleted successfully'); this.loadSuppliers(); },
    error: (err) => this.toast.error(err.error?.msg || 'Delete failed')
  });
}

openLedgerModal(supplier: any) {
  const modalRef = this.modalService.open(SupplierLedgerComponent, { 
    size: 'xl', // Bara size taake ledger saaf dikhayi de
    backdrop: 'static', 
    scrollable: true 
  });
  
  // Supplier ki ID aur Naam pass kar rahe hain
  modalRef.componentInstance.supplierId = supplier._id;
  modalRef.componentInstance.supplierName = supplier.name;
}
}