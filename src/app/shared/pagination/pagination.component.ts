import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3" *ngIf="total > 0">
      <div class="text-muted small">
        Showing <b>{{ startIndex }}</b>–<b>{{ endIndex }}</b> of <b>{{ total }}</b>
      </div>
      <nav *ngIf="totalPages > 1">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" [class.disabled]="page <= 1">
            <button class="page-link" (click)="go(page - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li class="page-item" *ngFor="let p of pages" [class.active]="p === page" [class.disabled]="p === -1">
            <button class="page-link" *ngIf="p !== -1" (click)="go(p)">{{ p }}</button>
            <span class="page-link" *ngIf="p === -1">…</span>
          </li>
          <li class="page-item" [class.disabled]="page >= totalPages">
            <button class="page-link" (click)="go(page + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .page-link { cursor: pointer; border-radius: 8px !important; margin: 0 2px; border: none; color: #475569; font-weight: 600; }
    .page-item.active .page-link { background: #4f46e5; color: #fff; }
    .page-item.disabled .page-link { color: #cbd5e1; cursor: not-allowed; }
    .pagination { gap: 2px; }
  `]
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() limit = 10;
  @Input() total = 0;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  get startIndex(): number { return this.total === 0 ? 0 : (this.page - 1) * this.limit + 1; }
  get endIndex(): number { return Math.min(this.page * this.limit, this.total); }

  // Windowed page list with -1 as ellipsis marker
  get pages(): number[] {
    const tp = this.totalPages;
    if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1);
    const p = this.page;
    const out: number[] = [1];
    if (p > 3) out.push(-1);
    for (let i = Math.max(2, p - 1); i <= Math.min(tp - 1, p + 1); i++) out.push(i);
    if (p < tp - 2) out.push(-1);
    out.push(tp);
    return out;
  }

  go(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.pageChange.emit(p);
  }
}
