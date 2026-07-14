import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericService } from '../../services/generic.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-repair-product',
  templateUrl: './add-repair-product.component.html'
})
export class AddRepairProductComponent implements OnInit {
  repairForm!: FormGroup;
  editMode = false;
  editId: string | null = null;
  loading = false;
  customers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private genericService: GenericService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.repairForm = this.fb.group({
      customer: [''],
      customerName: ['', Validators.required],
      customerPhone: [''],
      customerCNIC: [''],
      productName: ['', Validators.required],
      modelNumber: [''],
      serialNo: [''],
      issue: ['', Validators.required],
      status: ['Pending'],
      receivedDate: [new Date().toISOString().substring(0, 10)],
      completedDate: [''],
      estimatedCost: [0],
      totalCost: [0],
      amountReceived: [0],
      technician: [''],
      notes: ['']
    });

    this.genericService.getAll<any>('customer').subscribe(res => this.customers = res || []);

    this.editId = this.route.snapshot.queryParamMap.get('id');
    if (this.editId) {
      this.editMode = true;
      this.loadRepair();
    }
  }

  // Existing customer select karne par uska naam/phone auto-fill kar do
  onCustomerSelect(): void {
    const id = this.repairForm.get('customer')?.value;
    const c = this.customers.find(x => x._id === id);
    if (c) {
      this.repairForm.patchValue({ customerName: c.name, customerPhone: c.phone || '' });
    }
  }

  loadRepair() {
    this.genericService.getById<any>('repair', this.editId!).subscribe(res => {
      this.repairForm.patchValue({
        ...res,
        receivedDate: res.receivedDate ? new Date(res.receivedDate).toISOString().substring(0, 10) : '',
        completedDate: res.completedDate ? new Date(res.completedDate).toISOString().substring(0, 10) : ''
      });
    });
  }

  submit() {
    if (this.repairForm.invalid) {
      this.toast.error('Please fill all required fields.');
      return;
    }
    this.loading = true;
    const payload = this.repairForm.value;

    const request$ = this.editMode
      ? this.genericService.update('repair', this.editId!, payload)
      : this.genericService.create('repair', payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(this.editMode ? 'Repair job updated successfully!' : 'Repair job added successfully!');
        this.router.navigate(['/repair-product/list']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.error?.msg || 'Failed to save repair job');
      }
    });
  }
}
