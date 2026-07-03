import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AddProductComponent } from './products/add-product/add-product.component';
import { ProductsListComponent } from './products/products-list/products-list.component';
import { AddPurchaseComponent } from './purchases/add-purchase/add-purchase.component';
import { AddSupplierComponent } from './supplier/add-supplier/add-supplier.component';
import { SupplierListComponent } from './supplier/supplier-list/supplier-list.component';
import { PurchaseListComponent } from './purchases/purchase-list/purchase-list.component';
import { StockInventoryComponent } from './stock/stock-inventory/stock-inventory.component';
import { AddSaleComponent } from './sale/add-sale/add-sale.component';
import { SaleListComponent } from './sale/sale-list/sale-list.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { AddCustomerComponent } from './customer/add-customer/add-customer.component';
import { ReportsComponent } from './reports/reports.component';
import { GuideComponent } from './guide/guide.component';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', redirectTo: 'login', pathMatch: 'full' },

  // 🔒 Login/Signup: Agar already logged in ho to add-sale par bhejo
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [NoAuthGuard] },

  // 🔐 Protected Routes: Sirf logged-in user access kar sakta hai
  { path: 'products/add', component: AddProductComponent, canActivate: [AuthGuard] },
  { path: 'products/list', component: ProductsListComponent, canActivate: [AuthGuard] },
  { path: 'purchase/add', component: AddPurchaseComponent, canActivate: [AuthGuard] },
  { path: 'purchase/edit/:id', component: AddPurchaseComponent, canActivate: [AuthGuard] },
  { path: 'addSupplier', component: AddSupplierComponent, canActivate: [AuthGuard] },
  { path: 'supplierlist', component: SupplierListComponent, canActivate: [AuthGuard] },
  { path: 'purchase-list', component: PurchaseListComponent, canActivate: [AuthGuard] },
  { path: 'stock', component: StockInventoryComponent, canActivate: [AuthGuard] },
  { path: 'add-sale/:id', component: AddSaleComponent, canActivate: [AuthGuard] },
  { path: 'add-sale', component: AddSaleComponent, canActivate: [AuthGuard] },
  { path: 'sale-list', component: SaleListComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: CustomerListComponent, canActivate: [AuthGuard] },
  { path: 'add-customer', component: AddCustomerComponent, canActivate: [AuthGuard] },
  { path: 'edit-customer/:id', component: AddCustomerComponent, canActivate: [AuthGuard] },

  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'guide', component: GuideComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  // imports: [RouterModule.forRoot(routes)],
    imports: [
    RouterModule.forRoot(routes, { 
      scrollPositionRestoration: 'enabled' // Ye line add kar di hai
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
