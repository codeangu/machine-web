import { Component } from '@angular/core';

interface GuideStep { icon: string; title: string; steps: string[]; }

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent {
  sections: GuideStep[] = [
    {
      icon: 'bi-box-seam',
      title: '1. Add Your Products',
      steps: [
        'Open the "Products" menu and click "Add New Product".',
        'Type the product name, model, brand and year.',
        'Choose "Single Part" for normal items, or "Machine" for machines.',
        'Set the Unit Price and a Min Stock level (you get a Low Stock warning below it).',
        'Click "Save Product". Your new product now appears in the Products list.'
      ]
    },
    {
      icon: 'bi-truck',
      title: '2. Add Suppliers & Customers',
      steps: [
        'Go to "Supplier" and click "Add Supplier" to save who you buy from.',
        'Go to "Customers" and click "Add Customer" to save who you sell to.',
        'Phone and address are optional — only the name is required.'
      ]
    },
    {
      icon: 'bi-cart-plus',
      title: '3. Record a Purchase (buying stock)',
      steps: [
        'Open "Purchase" → "Add Purchase".',
        'Select the supplier and type an invoice number.',
        'Search a product, then set the quantity and purchase price.',
        'Enter how much you paid now in "Amount Paid" (you can pay part of it).',
        'Click "Save Purchase". Stock increases automatically.'
      ]
    },
    {
      icon: 'bi-receipt',
      title: '4. Make a Sale (selling to customer)',
      steps: [
        'Open "Sales" → "Add Sale".',
        'Choose a customer (or leave "Walking / Cash Customer").',
        'Scan the barcode or type the product name to add items.',
        'Set quantity and price, then enter "Cash Received".',
        'Click "Save & Print" to get a printable invoice. Stock decreases automatically.'
      ]
    },
    {
      icon: 'bi-arrow-return-left',
      title: '5. Returns (customer or supplier returns goods)',
      steps: [
        'For a customer return: open "Sales" list, click the ↩ Return button on the invoice.',
        'For a supplier return: open "Purchase" list, click the ↩ Return button on the invoice.',
        'Enter how many pieces are coming back, add a reason, then "Process Return".',
        'Stock and the customer/supplier balance update automatically.'
      ]
    },
    {
      icon: 'bi-sliders',
      title: '6. Adjust Stock (correcting counts)',
      steps: [
        'Open "Stock" and click the "Adjust" button next to a product.',
        'Type the correct stock quantity and/or minimum stock level.',
        'Add a short reason (e.g. physical count) and Save.',
        'Every change is saved in the history for your records.'
      ]
    },
    {
      icon: 'bi-cash-coin',
      title: '7. Receive & Track Payments (Ledger / Khata)',
      steps: [
        'In the Customers or Supplier list, click "Ledger" to see the full khata.',
        'Use "Pay" / "Receive" to record a payment against a balance.',
        'Red balance means money is owed; the totals update instantly.'
      ]
    },
    {
      icon: 'bi-bar-chart',
      title: '8. Reports',
      steps: [
        'Open "Reports" to see the Dashboard, Sales, Purchases and Low Stock.',
        'New tabs: Sale Returns, Purchase Returns and Stock Adjustments.',
        'Pick a date range (Today / This Month / All Time) and click "Print" for a copy.'
      ]
    }
  ];
}
