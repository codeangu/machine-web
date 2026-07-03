// src/app/supplier/add-supplier/add-supplier.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericService } from '../../services/generic.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html'
})
export class AddSupplierComponent implements OnInit {
  @Input() supplierData: any; 
  supplierForm!: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    public activeModal: NgbActiveModal,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.supplierData) {
      this.isEditMode = true;
      this.supplierForm.patchValue(this.supplierData);
    }
  }

  initForm() {
    this.supplierForm = this.fb.group({
      // 1. Basic Info
      name: ['', [Validators.required]],
      companyName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      status: ['Active'],
      
      // 2. Ledger Accounting Fields (As per Schema)
      openingBalance: [0],
      totalPurchase: [0],
      totalPaid: [0],
      
      // 3. Compatibility Fields (As per Schema)
      totalAmount: [0],
      paidAmount: [0]
    });
  }

  onSubmit() {
    if (this.supplierForm.invalid) return;
    this.loading = true;

    const request = this.isEditMode 
      ? this.genericService.update('supplier', this.supplierData._id, this.supplierForm.value)
      : this.genericService.create('supplier', this.supplierForm.value);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(this.isEditMode ? 'Supplier updated successfully!' : 'Supplier added successfully!');
        this.activeModal.close('saved');
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.msg || 'Error saving data');
      }
    });
  }
}