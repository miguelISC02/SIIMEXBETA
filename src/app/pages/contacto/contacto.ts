import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css'],
})
export class ContactoComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    // Solo en navegador (evita "document is not defined" con SSR/Vite)
    if (!isPlatformBrowser(this.platformId)) return;

    const form = document.getElementById('contactForm') as HTMLFormElement | null;
    const submitBtn = document.getElementById('contactSubmitBtn') as HTMLButtonElement | null;

    if (!form) return;

    // 1) Evita envío nativo (Enter o submit programático)
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });

    // 2) Click del botón "Enviar mensaje"
    if (submitBtn) {
      submitBtn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();

        // Validación Bootstrap/HTML
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          return;
        }

        // Aquí podrías llamar a tu API con fetch/HttpClient si quieres.
        await this.showSuccessModal();

        // Limpieza
        form.reset();
        form.classList.remove('was-validated');
      });
    }
  }

  private async showSuccessModal(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const modalEl = document.getElementById('contactSuccessModal');
    if (!modalEl) return;

    // Requiere bootstrap.bundle JS (ver nota abajo)
    const { Modal } = await import('bootstrap');
    const successModal = new Modal(modalEl);
    successModal.show();
  }
}
