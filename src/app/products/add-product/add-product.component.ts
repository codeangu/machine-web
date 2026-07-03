import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from 'src/app/services/generic.service';
import { ToastService } from 'src/app/services/toast.service';

export type ProductType = 'single' | 'machine';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html'
})
export class AddProductComponent implements OnInit {
  form!: FormGroup;
  productTypes = [
    { value: 'single', label: 'Single Part' },
    { value: 'machine', label: 'Machine' }
  ];
  loading  = false;
  editMode = false;
  editId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.editId   = params['id'];
        this.loadProductForEdit(this.editId!);
      }
    });

    this.form.get('type')?.valueChanges.subscribe(type => this.updateValidation(type));
    this.form.get('accessories')?.valueChanges.subscribe(acc => this.updatePrinterValidation(acc));
    this.updateValidation('single');
  }

  private buildForm(): void {
    this.form = this.fb.group({
      productName:       ['', Validators.required],
      model:             ['', Validators.required],
      brand:             ['', Validators.required],
      manufacturingYear: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      type:              ['single', Validators.required],
      barcode:           [''],
      notes:             [''],
      unitPrice:         [null],
      minStock:          [null],
      parts:             this.fb.array([]),
      serialNo:          [''],
      condition:         [''],
      accessories:       [''],
      printerType:       ['']
    });
  }

private loadProductForEdit(id: string): void {
  this.loading = true;
  this.genericService.getById<any>('product', id).subscribe({
    next: (product) => {
      this.loading = false;

      // 1. Pehle Type set karein taake sahi fields nazar aayein
      this.form.get('type')?.setValue(product.type);
      this.updateValidation(product.type);

      // 2. Normal fields ko patch karein
      this.form.patchValue({
        productName: product.productName,
        model: product.model,
        brand: product.brand,
        manufacturingYear: product.manufacturingYear,
        barcode: product.barcode || '',
        notes: product.notes || '',
        unitPrice: product.unitPrice,
        minStock: product.minStock,
        serialNo: product.serialNo || '',
        condition: product.condition || '',
        accessories: product.accessories || '',
        printerType: product.printerType || ''
      });

      // 3. Agar Machine hai toh Parts ko FormArray mein fill karein
      const partsArr = this.form.get('parts') as FormArray;
      partsArr.clear(); // Purana data saaf karein

      if (product.type === 'machine' && product.parts && product.parts.length > 0) {
        product.parts.forEach((p: any) => {
          partsArr.push(this.fb.group({
            name: [p.name, Validators.required],
            sku: [p.sku, Validators.required],
            qty: [p.qty, [Validators.required, Validators.min(1)]],
            unitCost: [p.unitCost, [Validators.required, Validators.min(0)]],
            serialNo: [p.serialNo || '']
          }));
        });
      }
    },
    error: (err) => { 
      this.loading = false;
      console.error(err);
      this.toast.error('Failed to load product details.');
    }
  });
}

  get partsArray(): FormArray    { return this.form.get('parts') as FormArray; }
  get isSinglePart(): boolean    { return this.form.get('type')?.value === 'single'; }
  get isMachine(): boolean       { return this.form.get('type')?.value === 'machine'; }

  // Parts related functions kept for future use
  addPartRow(): void {
    this.partsArray.push(this.fb.group({
      name: ['', Validators.required], sku: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      unitCost: [null, [Validators.required, Validators.min(0)]], serialNo: ['']
    }));
  }
  removePart(index: number): void { this.partsArray.removeAt(index); }

  updateValidation(type: ProductType): void {
    const singleFields  = ['unitPrice'];
    const machineFields = ['serialNo', 'condition'];

    if (type === 'single') {
      singleFields.forEach(f => this.form.get(f)?.setValidators([Validators.required, Validators.min(0)]));
      machineFields.forEach(f => { this.form.get(f)?.clearValidators(); this.form.get(f)?.setValue(''); });
      this.partsArray.clear();
    } else {
      machineFields.forEach(f => this.form.get(f)?.setValidators(Validators.required));
      this.partsArray.clearValidators();
      singleFields.forEach(f => { this.form.get(f)?.clearValidators(); this.form.get(f)?.setValue(null); });
    }
    Object.keys(this.form.controls).forEach(key => this.form.get(key)?.updateValueAndValidity({ emitEvent: false }));
  }

  updatePrinterValidation(accessory: string): void {
    const ctrl = this.form.get('printerType');
    if (accessory === 'Printers') { ctrl?.setValidators(Validators.required); } 
    else { ctrl?.clearValidators(); ctrl?.setValue(''); }
    ctrl?.updateValueAndValidity();
  }

submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.toast.error('Please fill all required fields correctly.');
    return;
  }

  this.loading = true;
  const raw = this.form.getRawValue(); // use getRawValue to get disabled fields if any
  const payload: any = { 
    ...raw,
    manufacturingYear: String(raw.manufacturingYear) // String conversion
  };

  if (this.isSinglePart) {
    delete payload.parts;
    delete payload.serialNo; 
    delete payload.condition; 
    delete payload.accessories; 
    delete payload.printerType;
  } else {
    // Agar parts array khali hai toh hi default bhein, warna jo loaded hain wahi jayenge
    if (!payload.parts || payload.parts.length === 0) {
      payload.parts = [{
        name: raw.productName + " Main Unit",
        sku: "MCH-" + (raw.model || 'GEN'),
        qty: 1,
        unitCost: 0,
        serialNo: raw.serialNo || 'N/A'
      }];
    }
    delete payload.unitPrice;
    delete payload.minStock;
  }

  const request$ = this.editMode
    ? this.genericService.update('product', this.editId!, payload)
    : this.genericService.create('product', payload);

  request$.subscribe({
    next: () => {
      this.loading = false;
      this.toast.success(this.editMode ? 'Product updated successfully!' : 'Product saved successfully!');
      this.router.navigate(['/products/list']);
    },
    error: (err) => {
      this.loading = false;
      this.toast.error(err.error?.msg || 'Failed to save product');
    }
  });
}

  resetForm(): void {
    this.form.reset({ type: 'single', manufacturingYear: '', notes: '' });
    this.partsArray.clear();
    this.updateValidation('single');
  }
}