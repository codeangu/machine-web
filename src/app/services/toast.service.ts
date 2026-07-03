import { Injectable } from '@angular/core';

export interface AppToast {
  id: number;
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: AppToast[] = [];
  private counter = 0;

  private push(text: string, type: AppToast['type'], delay = 3500) {
    const id = ++this.counter;
    this.toasts.push({ id, text, type });
    setTimeout(() => this.remove(id), delay);
  }

  success(text: string) { this.push(text, 'success'); }
  error(text: string)   { this.push(text, 'error', 5000); }
  info(text: string)    { this.push(text, 'info'); }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}
