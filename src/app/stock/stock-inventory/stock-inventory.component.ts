import { Component, OnInit } from '@angular/core';
import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-stock-inventory',
  templateUrl: './stock-inventory.component.html',
  styleUrls: ['./stock-inventory.component.scss']
})
export class StockInventoryComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';

  selectedProduct: any = null;
  batches: any[] = [];
  batchLoading = false;

  // Stock adjustment modal state
  adjustProduct: any = null;
  adjustStock: number | null = null;
  adjustMin: number | null = null;
  adjustReason: string = '';
  adjustSaving = false;
  adjustError = '';
  adjustLogs: any[] = [];

  constructor(private service: GenericService) {}

  ngOnInit() { this.loadStock(); }

  loadStock() {
    this.service.getAll<any>('product').subscribe(data => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.productName?.toLowerCase().includes(term) ||
      p.model?.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.barcode?.includes(term)
    );
  }

  showBatches(product: any) {
    this.selectedProduct = product;
    this.batches = [];
    this.batchLoading = true;
    this.service.getById<any[]>('product', product._id + '/batches').subscribe({
      next: (data: any) => { this.batches = data; this.batchLoading = false; },
      error: () => { this.batchLoading = false; }
    });
  }

  closeBatches() { this.selectedProduct = null; this.batches = []; }

  // ---------- Stock / Min-stock Adjustment ----------
  openAdjust(product: any) {
    this.adjustProduct = product;
    this.adjustStock = product.currentStock ?? 0;
    this.adjustMin = product.minStock ?? null;
    this.adjustReason = '';
    this.adjustError = '';
    this.adjustLogs = [];
    this.service.getById<any[]>('product', product._id + '/stock-logs').subscribe({
      next: (data: any) => this.adjustLogs = data || [],
      error: () => this.adjustLogs = []
    });
  }

  closeAdjust() {
    this.adjustProduct = null;
    this.adjustError = '';
  }

  saveAdjust() {
    if (!this.adjustProduct) return;
    this.adjustError = '';
    this.adjustSaving = true;
    const payload = {
      currentStock: this.adjustStock,
      minStock: this.adjustMin,
      reason: this.adjustReason?.trim()
    };
    this.service.create<any>('product/' + this.adjustProduct._id + '/adjust-stock', payload).subscribe({
      next: (res) => {
        this.adjustSaving = false;
        // Update the row in place so the table reflects the change immediately
        const updated = res.product;
        const idx = this.products.findIndex(p => p._id === updated._id);
        if (idx !== -1) this.products[idx] = { ...this.products[idx], ...updated };
        this.onSearch();
        this.closeAdjust();
      },
      error: (err) => {
        this.adjustSaving = false;
        this.adjustError = err.error?.msg || 'Failed to update stock.';
      }
    });
  }

  getLowStockCount() {
    return this.products.filter(p => (p.currentStock || 0) <= (p.minStock || 5)).length;
  }

  getOutOfStockCount() {
    return this.products.filter(p => (p.currentStock || 0) <= 0).length;
  }

  getTotalValue() {
    return this.products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.unitPrice || 0)), 0);
  }

  getStockStatus(p: any): string {
    if ((p.currentStock || 0) <= 0) return 'out';
    if ((p.currentStock || 0) <= (p.minStock || 5)) return 'low';
    return 'ok';
  }
}
