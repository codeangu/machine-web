import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GenericService } from '../../services/generic.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html'
})
export class ProductsListComponent implements OnInit {
  @ViewChild('linkedPartsModal', { static: true }) linkedPartsModal!: TemplateRef<any>;

  searchTerm = '';
  activeTab = 1; // 1: All, 2: Machine, 3: Single
  selectedProduct: any = null;
  filteredProducts: any[] = []; // Current page data
  loading = false;

  // Pagination + tab counts
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 1;
  counts = { all: 0, machine: 0, single: 0 };
  private searchTimer: any;

  constructor(
    private modalService: NgbModal,
    private genericService: GenericService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.applyFilters();
  }

  // Paginated backend fetch (search + type + counts come from one call)
  applyFilters(): void {
    this.loading = true;
    const params: any = { page: this.page, limit: this.limit };
    if (this.activeTab === 2) params.type = 'machine';
    if (this.activeTab === 3) params.type = 'single';
    if (this.searchTerm) params.search = this.searchTerm;

    this.genericService.getPaged<any>('product', params).subscribe({
      next: (res) => {
        this.filteredProducts = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.counts = res.summary || { all: 0, machine: 0, single: 0 };
        this.loading = false;
      },
      error: (err) => { this.loading = false; console.error(err); }
    });
  }

  // Tab change handler
  onTabChange(tab: number): void {
    this.activeTab = tab;
    this.page = 1;
    this.applyFilters();
  }

  // Search input handler (debounced, server-side)
  onSearchChange(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.page = 1; this.applyFilters(); }, 350);
  }

  onPageChange(p: number): void { this.page = p; this.applyFilters(); }

  // Action Methods
  openLinkedParts(product: any): void {
    this.selectedProduct = product;
    this.modalService.open(this.linkedPartsModal, { size: 'lg', centered: true });
  }

  editProduct(product: any): void {
    this.router.navigate(['/products/add'], { queryParams: { id: product._id } });
  }

  deleteProduct(product: any): void {
    if (!confirm(`Delete "${product.productName}"? This cannot be undone.`)) return;
    this.genericService.delete('product', product._id).subscribe({
      next: () => { this.toast.success('Product deleted successfully'); this.applyFilters(); },
      error: (err) => this.toast.error(err.error?.msg || 'Delete failed')
    });
  }

  // Helpers (counts come from backend summary)
  getMachineCount(): number { return this.counts.machine; }
  getSingleCount(): number { return this.counts.single; }
  getTotalQty(parts: any[]): number { return parts?.reduce((sum, p) => sum + (p.qty || 0), 0) || 0; }
  getTotalCost(parts: any[]): number { return parts?.reduce((sum, p) => sum + ((p.qty || 0) * (p.unitCost || 0)), 0) || 0; }
}