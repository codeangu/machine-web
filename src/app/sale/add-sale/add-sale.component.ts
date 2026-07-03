import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GenericService } from 'src/app/services/generic.service';
import { Router, ActivatedRoute } from '@angular/router';
import html2pdf from 'html2pdf.js';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html'
})
export class AddSaleComponent implements OnInit {
  saleForm: FormGroup;
  customers: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = []; 
  subTotal: number = 0;
  grandTotal: number = 0;

  isEditMode: boolean = false;
  saleId: string | null = null;

  // Invoice Display
  showInvoice: boolean = false;
  savedSale: any = null;

  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  constructor(
    private fb: FormBuilder, 
    private service: GenericService, 
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.saleForm = this.fb.group({
      customerId: [''],
      customerName: [''], 
      invoiceNumber: ['INV-' + Math.floor(1000 + Math.random() * 9000)],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      items: this.fb.array([]), 
      discount: [0],
      amountReceived: [0]
    });
  }

  ngOnInit() {
    this.service.getAll<any>('product').subscribe(res => {
      this.products = res;
      this.loadCustomers();

      this.saleId = this.route.snapshot.params['id'];
      if (this.saleId) {
        this.isEditMode = true;
        this.loadSaleForEdit(this.saleId);
      }
    });
  }

  loadCustomers() {
    this.service.getAll<any>('customer').subscribe(res => this.customers = res);
  }

  // --- UPDATED PATCH LOGIC BASED ON YOUR NETWORK RESPONSE ---
  loadSaleForEdit(id: string) {
    this.service.getById<any>('sale', id).subscribe({
      next: (res) => {
        this.saleForm.patchValue({
          customerId: res.customer?._id || '', // Network response mein 'customer' object hai
          customerName: res.customerName,
          invoiceNumber: res.invoiceNumber,
          date: res.date.substring(0, 10),
          discount: res.discount,
          amountReceived: res.amountReceived
        });

        const itemArray = this.items;
        itemArray.clear();

        res.items.forEach((item: any) => {
          // Aapka data item.product ke andar hai (screenshot ke mutabiq)
          const pInfo = item.product; 
          const targetId = pInfo?._id;
          
          // Latest stock ke liye matching
          const pDataFromStore = this.products.find(p => String(p._id) === String(targetId));

          itemArray.push(this.fb.group({
            productId: [targetId, Validators.required],
            // Yahan se value patch hogi: item.product.productName
            productName: [pInfo?.productName || (pDataFromStore ? pDataFromStore.productName : 'Unknown')], 
            quantity: [item.quantity, [Validators.required, Validators.min(1)]],
            salePrice: [item.salePrice, Validators.required],
            lineTotal: [item.lineTotal],
            availableStock: [pDataFromStore ? pDataFromStore.currentStock : 0]
          }));
        });

        this.calculateTotals();
      },
      error: (err) => this.toast.error("Failed to load data.")
    });
  }

  get items() {
    return this.saleForm.get('items') as FormArray;
  }

  // --- SMART SELECTOR & BARCODE LOGIC (BAQI CODE SAME RAHEGA) ---

  onSearchChange(event: any) {
    const term = event.target.value.toLowerCase().trim();
    if (term.length > 1) {
      this.filteredProducts = this.products.filter(p => 
        p.productName.toLowerCase().includes(term) || 
        (p.barcode && p.barcode.toLowerCase().includes(term))
      ).slice(0, 10);
    } else {
      this.filteredProducts = [];
    }
  }

  selectProduct(product: any) {
    this.addItemToTable(product);
    this.clearSearch();
  }

  onBarcodeScan(event: any) {
    const input = event.target.value.trim();
    if (!input) return;
    const product = this.products.find(p => p.barcode === input || p._id === input);
    if (product) {
      this.addItemToTable(product);
      this.clearSearch();
    } else if (this.filteredProducts.length > 0) {
      this.selectProduct(this.filteredProducts[0]);
    }
    event.target.value = '';
  }

  clearSearch() {
    this.filteredProducts = [];
    this.barcodeInput.nativeElement.value = '';
    this.barcodeInput.nativeElement.focus();
  }

  addItemToTable(product: any) {
    const existingIndex = this.items.controls.findIndex(x => x.get('productId')?.value === product._id);
    if (existingIndex !== -1) {
      const qtyCtrl = this.items.at(existingIndex).get('quantity');
      qtyCtrl?.setValue(qtyCtrl.value + 1);
      this.updateLineTotal(existingIndex);
    } else {
      this.items.push(this.fb.group({
        productId: [product._id, Validators.required],
        productName: [product.productName],
        quantity: [1, [Validators.required, Validators.min(1)]],
        salePrice: [product.unitPrice || 0, Validators.required],
        lineTotal: [product.unitPrice || 0],
        availableStock: [product.currentStock || 0]
      }));
      this.calculateTotals();
    }
  }

  updateLineTotal(index: number) {
    const item = this.items.at(index);
    const total = (item.get('quantity')?.value || 0) * (item.get('salePrice')?.value || 0);
    item.get('lineTotal')?.setValue(total);
    this.calculateTotals();
  }

  calculateTotals() {
    this.subTotal = this.items.controls.reduce((acc, ctrl) => acc + (ctrl.get('lineTotal')?.value || 0), 0);
    this.grandTotal = this.subTotal - (this.saleForm.get('discount')?.value || 0);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateTotals();
  }

saveSale() {
  if (this.saleForm.invalid || this.items.length === 0) {
    this.toast.error("Please add products and fill all required fields.");
    return;
  }

  // Payload taiyar karein
  const payload = {
    ...this.saleForm.getRawValue(),
    grandTotal: this.grandTotal,
    subTotal: this.subTotal
  };

  if (this.isEditMode && this.saleId) {
    this.service.update('sale', this.saleId, payload).subscribe({
      next: () => {
        this.savedSale = { ...payload };
        // get customer name if cash
        if (!this.savedSale.customerId && this.savedSale.customerName) {
           this.savedSale.customerDisplay = this.savedSale.customerName;
        } else if (this.savedSale.customerId) {
           const cust = this.customers.find(c => c._id === this.savedSale.customerId);
           this.savedSale.customerDisplay = cust ? cust.name : 'Unknown';
        } else {
           this.savedSale.customerDisplay = 'Walking Customer';
        }
        this.showInvoice = true;
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.msg || "Failed to update the sale. Please try again.");
      }
    });
  } else {
    // Create new sale
    this.service.create('sale', payload).subscribe({
      next: () => {
        this.savedSale = { ...payload };
        if (!this.savedSale.customerId && this.savedSale.customerName) {
           this.savedSale.customerDisplay = this.savedSale.customerName;
        } else if (this.savedSale.customerId) {
           const cust = this.customers.find(c => c._id === this.savedSale.customerId);
           this.savedSale.customerDisplay = cust ? cust.name : 'Unknown';
        } else {
           this.savedSale.customerDisplay = 'Walking Customer';
        }
        this.showInvoice = true;
      },
      error: (err) => this.toast.error(err.error?.msg || "Server Error")
    });
  }
}

  newSale() {
    this.showInvoice = false;
    this.savedSale = null;
    this.isEditMode = false;
    this.saleId = null;
    this.items.clear();
    this.saleForm.reset({
      invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().substring(0, 10),
      discount: 0,
      amountReceived: 0
    });
    this.subTotal = 0;
    this.grandTotal = 0;
  }

  printInvoice() {
    window.print();
  }

  downloadPDF() {
    const element = document.getElementById('invoice-preview');
    if (!element) { this.toast.error('Invoice preview not found.'); return; }
    const opt = {
      margin: 0.5,
      filename: `Invoice_${this.savedSale?.invoiceNumber || 'sale'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    html2pdf().from(element).set(opt).save();
  }
}