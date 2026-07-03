import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div class="app-toast-wrap">
      <div *ngFor="let t of toastService.toasts" class="app-toast" [class.t-success]="t.type==='success'"
           [class.t-error]="t.type==='error'" [class.t-info]="t.type==='info'">
        <i class="bi" [class.bi-check-circle-fill]="t.type==='success'"
           [class.bi-exclamation-triangle-fill]="t.type==='error'"
           [class.bi-info-circle-fill]="t.type==='info'"></i>
        <span class="app-toast-text">{{ t.text }}</span>
        <button class="app-toast-close" (click)="toastService.remove(t.id)"><i class="bi bi-x"></i></button>
      </div>
    </div>
  `,
  styles: [`
    .app-toast-wrap {
      position: fixed; top: 18px; right: 18px; z-index: 1080;
      display: flex; flex-direction: column; gap: 10px; max-width: 380px;
    }
    .app-toast {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border-radius: 12px; padding: 12px 14px;
      box-shadow: 0 12px 32px rgba(15,23,42,.16), 0 2px 6px rgba(15,23,42,.08);
      border-left: 5px solid #64748b;
      animation: toastIn .22s cubic-bezier(.2,.8,.3,1);
      font-size: .9rem; font-weight: 500; color: #1e293b;
    }
    .app-toast i.bi { font-size: 1.2rem; }
    .app-toast.t-success { border-left-color: #16a34a; }
    .app-toast.t-success > i.bi { color: #16a34a; }
    .app-toast.t-error { border-left-color: #e11d48; }
    .app-toast.t-error > i.bi { color: #e11d48; }
    .app-toast.t-info { border-left-color: #4f46e5; }
    .app-toast.t-info > i.bi { color: #4f46e5; }
    .app-toast-text { flex: 1; }
    .app-toast-close {
      border: none; background: transparent; color: #94a3b8; cursor: pointer;
      font-size: 1rem; line-height: 1; padding: 0;
    }
    .app-toast-close:hover { color: #475569; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
