import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupComponent } from './signup/signup.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderComponent } from './shared/loader/loader.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { SucessMessagesComponent } from './sucess-messages/sucess-messages.component';
import { ErrorMessagesComponent } from './error-messages/error-messages.component';
import { AddEditProductComponent } from './shared/popup/add-edit-product/add-edit-product.component';
import { AddProductComponent } from './products/add-product/add-product.component';
import { ProductsListComponent } from './products/products-list/products-list.component';
import { AddPurchaseComponent } from './purchases/add-purchase/add-purchase.component';
import { AddSupplierComponent } from './supplier/add-supplier/add-supplier.component';
import { SupplierListComponent } from './supplier/supplier-list/supplier-list.component';
import { AuthInterceptor } from './services/interceptors/auth.interceptor';
import { PurchaseListComponent } from './purchases/purchase-list/purchase-list.component';
import { StockInventoryComponent } from './stock/stock-inventory/stock-inventory.component';
import { AddSaleComponent } from './sale/add-sale/add-sale.component';
import { SaleListComponent } from './sale/sale-list/sale-list.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { AddCustomerComponent } from './customer/add-customer/add-customer.component';
import { CustomerLedgerComponent } from './customer/customer-ledger/customer-ledger.component';
import { SupplierLedgerComponent } from './supplier/supplier-ledger/supplier-ledger.component';
import { PaymentModalComponent } from './shared/payment-modal/payment-modal.component';
import { ReportsComponent } from './reports/reports.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';
import { GuideComponent } from './guide/guide.component';
import { PaginationComponent } from './shared/pagination/pagination.component';
// import {ServiceWorkerModule} from '@angular/service-worker';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    SignupComponent,
    LoaderComponent,
    SucessMessagesComponent,
    ErrorMessagesComponent,
    AddEditProductComponent,
    AddProductComponent,
    ProductsListComponent,
    AddPurchaseComponent,
    AddSupplierComponent,
    SupplierListComponent,
    PurchaseListComponent,
    StockInventoryComponent,
    AddSaleComponent,
    SaleListComponent,
    CustomerListComponent,
    AddCustomerComponent,
    CustomerLedgerComponent,
    SupplierLedgerComponent,
    PaymentModalComponent,
    ReportsComponent,
    ToastContainerComponent,
    GuideComponent,
    PaginationComponent,
  ],
  imports: [
    AngularEditorModule,
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    BrowserAnimationsModule,
  //   ServiceWorkerModule.register("ngsw-worker.js", {
  //     enabled: environment.production,
  //     registrationStrategy: "registerImmediately"
  // }),
 
  ],
 providers: [
     {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { provide: 'baseURL', useValue: environment.baseURL }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
