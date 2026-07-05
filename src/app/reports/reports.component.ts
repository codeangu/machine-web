import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent implements OnInit {
  activeTab = 'dashboard';

  // Date filters
  fromDate = '';
  toDate = '';

  // Data
  summary: any = null;
  salesReport: any = null;
  purchasesReport: any = null;
  lowStock: any[] = [];
  saleReturns: any[] = [];
  purchaseReturns: any[] = [];
  stockAdjustments: any = null;
  profitLoss: any = null;
  walkingSales: any = null;
  productSales: any = null;
  stockValuation: any = null;

  loading = false;

  // Today's date as default
  today = new Date().toISOString().substring(0, 10);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Default: today
    this.fromDate = this.today;
    this.toDate = this.today;
    this.loadSummary();
  }

  get headers() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadSummary() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/summary`, { headers: this.headers })
      .subscribe({ next: d => { this.summary = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadSales() {
    this.loading = true;
    let params = new HttpParams();
    if (this.fromDate) params = params.set('from', this.fromDate);
    if (this.toDate)   params = params.set('to', this.toDate);
    this.http.get<any>(`${environment.baseURL}/reports/sales`, { headers: this.headers, params })
      .subscribe({ next: d => { this.salesReport = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadPurchases() {
    this.loading = true;
    let params = new HttpParams();
    if (this.fromDate) params = params.set('from', this.fromDate);
    if (this.toDate)   params = params.set('to', this.toDate);
    this.http.get<any>(`${environment.baseURL}/reports/purchases`, { headers: this.headers, params })
      .subscribe({ next: d => { this.purchasesReport = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadLowStock() {
    this.loading = true;
    this.http.get<any[]>(`${environment.baseURL}/reports/low-stock`, { headers: this.headers })
      .subscribe({ next: d => { this.lowStock = d; this.loading = false; }, error: () => this.loading = false });
  }

  private rangeParams(): HttpParams {
    let params = new HttpParams();
    if (this.fromDate) params = params.set('from', this.fromDate);
    if (this.toDate)   params = params.set('to', this.toDate);
    return params;
  }

  loadSaleReturns() {
    this.loading = true;
    this.http.get<any[]>(`${environment.baseURL}/sale-return`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.saleReturns = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadPurchaseReturns() {
    this.loading = true;
    this.http.get<any[]>(`${environment.baseURL}/purchase-return`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.purchaseReturns = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadStockAdjustments() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/stock-adjustments`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.stockAdjustments = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadProfitLoss() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/profit-loss`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.profitLoss = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadWalkingSales() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/walking-sales`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.walkingSales = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadProductSales() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/product-sales`, { headers: this.headers, params: this.rangeParams() })
      .subscribe({ next: d => { this.productSales = d; this.loading = false; }, error: () => this.loading = false });
  }

  loadStockValuation() {
    this.loading = true;
    this.http.get<any>(`${environment.baseURL}/reports/stock-valuation`, { headers: this.headers })
      .subscribe({ next: d => { this.stockValuation = d; this.loading = false; }, error: () => this.loading = false });
  }

  get saleReturnsTotal(): number { return this.saleReturns.reduce((s, r) => s + (r.totalAmount || 0), 0); }
  get purchaseReturnsTotal(): number { return this.purchaseReturns.reduce((s, r) => s + (r.totalAmount || 0), 0); }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'dashboard') this.loadSummary();
    else if (tab === 'sales') this.loadSales();
    else if (tab === 'purchases') this.loadPurchases();
    else if (tab === 'lowstock') this.loadLowStock();
    else if (tab === 'salereturns') this.loadSaleReturns();
    else if (tab === 'purchasereturns') this.loadPurchaseReturns();
    else if (tab === 'stockadjust') this.loadStockAdjustments();
    else if (tab === 'profitloss') this.loadProfitLoss();
    else if (tab === 'walking') this.loadWalkingSales();
    else if (tab === 'productsales') this.loadProductSales();
    else if (tab === 'stockval') this.loadStockValuation();
  }

  applyFilter() {
    if (this.activeTab === 'sales') this.loadSales();
    else if (this.activeTab === 'purchases') this.loadPurchases();
    else if (this.activeTab === 'salereturns') this.loadSaleReturns();
    else if (this.activeTab === 'purchasereturns') this.loadPurchaseReturns();
    else if (this.activeTab === 'stockadjust') this.loadStockAdjustments();
    else if (this.activeTab === 'profitloss') this.loadProfitLoss();
    else if (this.activeTab === 'walking') this.loadWalkingSales();
    else if (this.activeTab === 'productsales') this.loadProductSales();
  }

  setQuickRange(range: string) {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    if (range === 'today') {
      this.fromDate = fmt(now); this.toDate = fmt(now);
    } else if (range === 'week') {
      const s = new Date(now); s.setDate(now.getDate() - 6);
      this.fromDate = fmt(s); this.toDate = fmt(now);
    } else if (range === 'month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      this.fromDate = fmt(s); this.toDate = fmt(now);
    } else if (range === 'all') {
      this.fromDate = ''; this.toDate = '';
    }
    this.applyFilter();
  }

  printReport() {
    window.print();
  }

  getStockStatus(p: any): string {
    if ((p.currentStock || 0) <= 0) return 'out';
    if ((p.currentStock || 0) <= (p.minStock || 5)) return 'low';
    return 'ok';
  }
}
