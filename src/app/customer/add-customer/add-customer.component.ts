import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GenericService } from '../../services/generic.service';
import { Router, ActivatedRoute } from '@angular/router'; // ActivatedRoute add kiya
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html'
})
export class AddCustomerComponent implements OnInit {
  customerForm!: FormGroup;
  editMode = false; // Check karne ke liye ke Edit ho raha hai ya Add
  customerId: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private genericService: GenericService, 
    private router: Router,
    private route: ActivatedRoute, // Route info lene ke liye
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // 1. Form initialization
    this.customerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
      address: [''],
      email: [''],
      openingBalance: [0],
      isWalking: [false]
    });

    // 2. Check if ID exists in URL (Edit Mode)
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.editMode = true;
      this.loadCustomerData();
    }
  }

  loadCustomerData() {
    this.genericService.getById<any>('customer', this.customerId!).subscribe(res => {
      this.customerForm.patchValue(res);
      // Edit mode mein opening balance change nahi karne dena chahiye
      this.customerForm.get('openingBalance')?.disable(); 
    });
  }

  saveCustomer() {
    if (this.customerForm.invalid) {
      this.toast.error("Please fill all required fields.");
      return;
    }

    // Form data (Disabled fields normally value nahi dete, isliye raw value lenge)
    const formData = this.customerForm.getRawValue();

    if (this.editMode) {
      // UPDATE Logic
      this.genericService.update('customer', this.customerId!, formData).subscribe({
        next: () => {
          this.toast.success('Customer updated successfully!');
          this.router.navigate(['/customers']);
        },
        error: (err) => this.toast.error(err.error?.msg || 'Failed to update customer')
      });
    } else {
      // CREATE Logic
      this.genericService.create('customer', formData).subscribe({
        next: () => {
          this.toast.success('Customer added successfully!');
          this.router.navigate(['/customers']);
        },
        error: (err) => this.toast.error(err.error?.msg || 'Failed to add customer')
      });
    }
  }
}