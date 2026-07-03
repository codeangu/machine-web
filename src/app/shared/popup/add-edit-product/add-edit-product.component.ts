import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-edit-product',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Add / Edit Product</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
      <!-- Add form fields here as needed -->
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Close</button>
    </div>
  `,
  styles: [``]
})
export class AddEditProductComponent {
  @Input() message?: string;

  constructor(public activeModal: NgbActiveModal) {}
}
