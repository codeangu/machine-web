import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { GenericService } from '../../services/generic.service';
import { ActivatedRoute, Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-purchase',
  templateUrl: './add-purchase.component.html',
  styleUrls: ['./add-purchase.component.scss']
})
export class AddPurchaseComponent implements OnInit {
  form!: FormGroup;
  searchModel = '';
  products: any[] = [];
  suppliers: any[] = [];
  loading = false;
  autoDownloadPdf = false;

  // Edit logic variables
  isEditMode = false;
  purchaseId: string | null = null;

  // Invoice display
  showInvoice = false;
  savedPurchase: any = null;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();

    // Check if we are in Edit Mode
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    if (this.purchaseId) {
      this.isEditMode = true;
      this.loadPurchaseForEdit(this.purchaseId);
    }
  }

  initForm() {
    this.form = this.fb.group({
      header: this.fb.group({
        supplier: ['', Validators.required],
        invoiceNumber: ['', Validators.required],
        invoiceDate: [new Date().toISOString().substring(0, 10), Validators.required],
        deliveryCharges: [0],
        globalDiscount: [0],
        globalTax: [0],
        amountPaid: [0]
      }),
      items: this.fb.array([])
    });
  }

  // Edit ke liye data load karne ka function
  loadPurchaseForEdit(id: string) {
    this.loading = true;
    this.genericService.getById<any>('purchase', id).subscribe({
      next: (data) => {
        // 1. Header fill karein
        this.form.patchValue({
          header: {
            supplier: data.supplier?._id || data.supplierId,
            invoiceNumber: data.purchaseNumber || data.invoiceNumber,
            invoiceDate: data.date ? new Date(data.date).toISOString().substring(0, 10) : '',
            deliveryCharges: data.deliveryCharges || 0,
            globalDiscount: data.items?.reduce((sum: number, item: any) => sum + (item.discount || 0), 0) || 0,
            globalTax: data.items?.[0]?.taxPercentage || 0,
            amountPaid: data.amountPaid || 0
          }
        });

        // 2. Items (FormArray) fill karein
        const itemsArray = data.items || [];
        itemsArray.forEach((item: any) => {
          const prod = item.product || {};
          this.addInvoiceItem({
            productId: prod._id || item.product,
            productName: prod.productName || '',
            model: prod.model || '',
            type: item.productType || prod.type || 'part',
            serialNumber: item.serialNumber || '',
            quantity: item.quantity,
            unitCost: item.purchasePrice,
            unitPriceText: item.sellingPrice
          });
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error("Failed to load data.");
        this.loading = false;
      }
    });
  }

  loadInitialData() {
    this.genericService.getAll<any>('supplier').subscribe(res => this.suppliers = res);
    this.genericService.getAll<any>('product').subscribe(res => this.products = res);
  }

  get headerGroup(): FormGroup { return this.form.get('header') as FormGroup; }
  get items(): FormArray { return this.form.get('items') as FormArray; }
  get itemsGroups(): FormGroup[] { return this.items.controls as FormGroup[]; }

  searchProducts = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        if (term.length < 1) return [];
        const t = term.toLowerCase();
        return this.products.filter(p =>
          p.productName?.toLowerCase().includes(t) ||
          p.model?.toLowerCase().includes(t) ||
          p.brand?.toLowerCase().includes(t) ||
          p.barcode === term
        ).slice(0, 10);
      })
    );

  formatter = (p: any) => p ? `${p.productName} — ${p.model}${p.barcode ? ' | ' + p.barcode : ''}` : '';

  onProductSelected(event: NgbTypeaheadSelectItemEvent): void {
    this.addInvoiceItem(event.item);
    setTimeout(() => this.searchModel = '', 0);
  }

  addInvoiceItem(product: any): void {
    const itemGroup = this.fb.group({
      productId: [product.productId || product._id],
      productName: [product.productName || ''],
      model: [product.model || ''],
      type: [product.type || 'part'],
      serialNumber: [product.serialNumber || '', Validators.required],
      quantity: [product.quantity || 1, [Validators.required, Validators.min(1)]],
      unitCost: [product.unitCost ?? product.unitPrice ?? 0, Validators.required],
      unitPriceText: [product.unitPriceText ?? ''],
      expanded: [false],
      parts: this.fb.array([])
    });

    this.items.push(itemGroup);
  }

  removeItem(i: number) { this.items.removeAt(i); }

  getLineTotal(item: AbstractControl): number {
    const val = item.value;
    return val.quantity * val.unitCost;
  }

  get subtotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const val = item.value;
      return sum + (val.quantity * val.unitCost);
    }, 0);
  }

  get totalTax(): number {
    const globalTax = Number(this.headerGroup.get('globalTax')?.value) || 0;
    const globalDiscount = Number(this.headerGroup.get('globalDiscount')?.value) || 0;
    let taxableAmount = this.subtotal - globalDiscount;
    if (taxableAmount < 0) taxableAmount = 0;
    return taxableAmount * (globalTax / 100);
  }

  get deliveryCharges(): number {
    return Number(this.headerGroup.get('deliveryCharges')?.value) || 0;
  }

  get grandTotal(): number {
    const globalDiscount = Number(this.headerGroup.get('globalDiscount')?.value) || 0;
    return this.subtotal - globalDiscount + this.totalTax + this.deliveryCharges;
  }

  get amountPaid(): number { return Number(this.headerGroup.get('amountPaid')?.value) || 0; }
  get balanceDue(): number { return this.grandTotal - this.amountPaid; }

  // Get supplier name for invoice
  getSupplierName(supplierId: string): string {
    const s = this.suppliers.find(sup => sup._id === supplierId);
    return s ? `${s.name} (${s.companyName})` : supplierId;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error("Please fill all required fields!");
      return;
    }

    if (this.amountPaid > this.grandTotal) {
      this.toast.error('Amount Paid cannot be more than the Grand Total.');
      return;
    }

    this.loading = true;
    const f = this.form.value;
    const globalTax = Number(f.header.globalTax) || 0;
    const globalDiscount = Number(f.header.globalDiscount) || 0;
    const totalItemsAmount = this.subtotal;

    const payload = {
      header: { 
        supplierId: f.header.supplier, 
        invoiceNumber: f.header.invoiceNumber, 
        invoiceDate: f.header.invoiceDate,
        deliveryCharges: f.header.deliveryCharges || 0
      },
      items: f.items.map((item: any, idx: number) => {
        const lineVal = item.quantity * item.unitCost;
        const itemDiscount = totalItemsAmount > 0 ? (lineVal / totalItemsAmount) * globalDiscount : 0;
        
        return {
          productId: item.productId,
          productName: item.productName,
          model: item.model,
          type: item.type,
          serialNumber: item.serialNumber,
          quantity: item.quantity,
          unitCost: item.unitCost,
          unitPriceText: item.unitPriceText,
          taxPercentage: globalTax,
          discount: itemDiscount,
          totalAmount: this.getLineTotal(this.items.at(idx)),
          linkedParts: []
        };
      }),
      subtotal: this.subtotal - globalDiscount, // Backend expects subtotal after discount
      totalTax: this.totalTax,
      deliveryCharges: this.deliveryCharges,
      grandTotal: this.grandTotal,
      amountPaid: this.amountPaid
    };

    const onSuccess = () => {
      this.loading = false;
      this.savedPurchase = { ...payload, supplierName: this.getSupplierName(f.header.supplier) };
      this.showInvoice = true;
      if (this.autoDownloadPdf) {
        setTimeout(() => this.downloadPDF(), 600);
      }
    };

    const onError = (err: any) => {
      this.toast.error(err.error?.msg || "Error saving purchase");
      this.loading = false;
    };

    if (this.isEditMode && this.purchaseId) {
      this.genericService.update('purchase', this.purchaseId, payload).subscribe({ next: onSuccess, error: onError });
    } else {
      this.genericService.create('purchase', payload).subscribe({ next: onSuccess, error: onError });
    }
  }

  submitAndPdf() {
    this.autoDownloadPdf = true;
    this.submit();
  }

  // New purchase start karo
  newPurchase() {
    this.showInvoice = false;
    this.savedPurchase = null;
    this.isEditMode = false;
    this.purchaseId = null;
    this.form.reset();
    this.initForm();
  }

  // Print invoice
  printInvoice() {
    window.print();
  }

  downloadPDF() {
    const element = document.getElementById('invoice-preview');
    if (!element) { this.toast.error('Invoice not found'); return; }
    const opt = {
      margin: 0.5,
      filename: `Purchase_Invoice_${this.savedPurchase.header.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().from(element).set(opt).save();
  }
}