import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../theme.service';
import { AuthService } from '../services/auth/auth.service';

// Interface to define the structure of our Navigation Links
interface NavLink {
  label: string;
  route?: string;
  isOpen?: boolean; // Track hover state per individual item
  dropdown?: { label: string; route: string }[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isCollapsed: boolean = true;
  isDarkMode: boolean = false;
  user: any = null;
  userid: any = null;
  role: any = null;

  // Main Navigation Configuration
  navLinks: NavLink[] = [
    {
      label: 'Products',
      isOpen: false,
      dropdown: [
        { label: 'Add Product', route: '/products/add' },
        { label: 'Products List', route: '/products/list' },
        { label: 'Repair Product', route: '/repair-product/add' },
        { label: 'Repair Product List', route: '/repair-product/list' },
        { label: 'Repair Report', route: '/repair-product/report' }
      ]
    },
        {
      label: 'Sales',
      isOpen: false,
      dropdown: [
        { label: 'Add Sale', route: '/add-sale' },
        { label: 'Sales List', route: '/sale-list' }
      ]
    },
    {
      label: 'Purchase',
      isOpen: false,
      dropdown: [
        { label: 'Add Purchase', route: '/purchase/add' },
        { label: 'Purchase List', route: '/purchase-list' }
      ]
    },
    { label: 'Stock', route: '/stock' },
    {
      label: 'People',
      isOpen: false,
      dropdown: [
        { label: 'Supplier', route: '/supplierlist' },
        { label: 'Customer List', route: '/customers' }
      ]
    },
    { label: 'Reports', route: '/reports' },
  ];

  constructor(
    private authService: AuthService,
    public router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.themeService.loadTheme();
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.authService.getCurrentUser().subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.userid = user.id || user._id || user.uid;
        this.role = user.role;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.userid = null;
    this.role = null;
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
      this.themeService.enableLightMode();
      this.isDarkMode = false;
    } else {
      this.themeService.enableDarkMode();
      this.isDarkMode = true;
    }
  }
}