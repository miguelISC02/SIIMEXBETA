import { Component, AfterViewInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-convocatorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './convocatorias.html',
  styleUrls: ['./convocatorias.css']
})
export class ConvocatoriasComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  @ViewChild('cardsContainer', { static: true }) cardsContainer!: ElementRef<HTMLElement>;
  @ViewChild('feedbackBar', { static: true }) feedbackBar!: ElementRef<HTMLElement>;
  @ViewChild('emptyState', { static: true }) emptyState!: ElementRef<HTMLElement>;

  form = this.fb.group({
    q: [''],
    area: ['']
  });

  applying = false;

  ngAfterViewInit() {
    this.form.valueChanges.pipe(debounceTime(220)).subscribe(() => this.filter());
    this.filter(); // primera pasada
  }

  private normalize(text: any) {
    return (text || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  filter() {
    const q = this.normalize(this.form.value.q);
    const area = (this.form.value.area || '').toString();

    // feedback ON
    this.setDisplay(this.feedbackBar, '');

    // defer para UX suave
    setTimeout(() => {
      const container = this.cardsContainer?.nativeElement;
      const cols = Array.from(container?.children ?? []) as HTMLElement[];

      let visible = 0;
      for (const col of cols) {
        const keywords = this.normalize(col.dataset['keywords']);
        const cardArea = (col.dataset['area'] || '').toString();
        const textContent = this.normalize(col.textContent);

        const matchesQuery = !q || keywords.includes(q) || textContent.includes(q);
        const matchesArea = !area || cardArea === area;

        if (matchesQuery && matchesArea) {
          col.style.display = '';
          visible++;
        } else {
          col.style.display = 'none';
        }
      }

      // empty state
      this.setDisplay(this.emptyState, visible === 0 ? '' : 'none');
      // feedback OFF
      this.setDisplay(this.feedbackBar, 'none');
    }, 0);
  }

  private setDisplay(ref: ElementRef<HTMLElement>, value: '' | 'none') {
    if (ref?.nativeElement) ref.nativeElement.style.display = value;
  }

  // Confirmación UX y navegación Angular (si la quieres usar en algún botón)
  confirmAndGo(url: string) {
    const ok = globalThis.confirm?.('Vas a iniciar la postulación. ¿Deseas continuar?');
    if (ok) this.router.navigateByUrl(url);
  }

  // Bootstrap Modal (dinámico y SSR-safe)
  async showModalById(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const { Modal } = await import('bootstrap');
    const modal = new Modal(el);
    modal.show();
  }
}
