import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnInit,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

type Pub = {
  title: string;
  type?: string;
  authors?: string;
  year?: string | number;
  file?: string;
  abstract?: string;
};

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css'],
  encapsulation: ViewEncapsulation.None, // para que los estilos globales apliquen sin pelea
})
export class PublicacionesComponent implements OnInit, AfterViewInit {
  // ===== Tabs =====
  activeTab: 'browse' | 'submit' = 'browse';

  // ===== Refs existentes =====
  @ViewChild('publicationsGrid', { static: false })
  publicationsGrid!: ElementRef<HTMLElement>;
  @ViewChild('pubModal', { static: false })
  pubModalRef!: ElementRef<HTMLElement>;
  @ViewChild('pubDetails', { static: false })
  pubDetailsRef!: ElementRef<HTMLElement>;
  @ViewChild('pubDetailsOpen', { static: false })
  pubDetailsOpenRef!: ElementRef<HTMLAnchorElement>;

  private bsModal: any | null = null;
  private readonly fallbackPdf = 'assets/cv/curriculumVitae-Ejemplos.pdf';


  // Dentro de PublicacionesComponent
toJson(o: unknown): string {
  return JSON.stringify(o);
}


  constructor(
    private route: ActivatedRoute,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ===== Tabs: lee ?tab= y permite deep-link =====
  ngOnInit(): void {
    this.route.queryParamMap.subscribe((q) => {
      const t = (q.get('tab') || '').toLowerCase();
      this.activeTab = t === 'submit' ? 'submit' : 'browse';
    });
  }

  onTabChange(tab: 'browse' | 'submit') {
    this.activeTab = tab;
    if (isPlatformBrowser(this.platformId)) {
      const base = this.location.path().split('?')[0] || this.location.path();
      this.location.replaceState(`${base}?tab=${tab}`);
    }
  }

  // ===== UX: listeners del grid, modal y submit =====
  async ngAfterViewInit() {

// en ngAfterViewInit()
if (isPlatformBrowser(this.platformId)) {
  const header = document.querySelector('.publications-header') as HTMLElement | null;
  const tabs = document.querySelector('.segmented') as HTMLElement | null;
  const navFixed = document.querySelector('.navbar.fixed-top') as HTMLElement | null;

  const h = (navFixed?.offsetHeight ?? 0)
          + (tabs?.offsetHeight ?? 0)
          + 12; // gap

  document.documentElement.style.setProperty('--sticky-offset', `${h}px`);
}


    if (!isPlatformBrowser(this.platformId)) return; // SSR/HMR safe

    // 1) Delegación de clicks en el grid -> abre modal de detalles
    this.publicationsGrid?.nativeElement.addEventListener('click', (ev) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;

      const btnVer = (target.closest(
        '[data-bs-target="#pubModal"][data-pub]'
      ) as HTMLElement | null)!;
      if (btnVer) {
        const raw = btnVer.getAttribute('data-pub') ?? '{}';
        const pub = this.safeParsePub(raw);
        this.openPubModal(pub);
        ev.preventDefault();
      }
    });

    // 2) Botón “Abrir PDF” dentro del modal
    this.pubDetailsOpenRef?.nativeElement.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const href =
        this.pubDetailsOpenRef.nativeElement.getAttribute('href') ||
        this.fallbackPdf;
      window.open(href, '_blank', 'noopener');
    });

    // 3) Botón “Solicitar Revisión” del formulario
    const submitBtn = document.getElementById('submitPublicationBtn');
    submitBtn?.addEventListener('click', async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const form = document.getElementById(
        'publicacionForm'
      ) as HTMLFormElement | null;

      if (form && !form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      // Aquí iría tu POST real
      await this.showSuccessModal();

      if (form) {
        form.reset();
        form.classList.remove('was-validated');
      }
    });
  }

  // ===== Modal de publicación =====
  private async openPubModal(pub: Pub): Promise<void> {
    const file = pub.file || this.fallbackPdf;
    const details = this.pubDetailsRef.nativeElement;
    details.innerHTML = this.renderPubDetails(pub);
    this.pubDetailsOpenRef.nativeElement.setAttribute('href', file);

    const el = this.pubModalRef.nativeElement;
    const { Modal } = await import('bootstrap');
    this.bsModal = this.bsModal || new Modal(el);
    this.bsModal.show();
  }

  // ===== Modal de confirmación =====
  private async showSuccessModal(): Promise<void> {
    const modalEl = document.getElementById('successModal');
    if (!modalEl) {
      console.warn('⚠️ No se encontró el modal con id="successModal"');
      return;
    }
    const { Modal } = await import('bootstrap');
    new Modal(modalEl).show();
  }

  // ===== Render helpers =====
  private renderPubDetails(pub: Pub): string {
    const title = this.escape(pub.title || 'Sin título');
    const authors = this.escape(pub.authors || 'Autor(es) no especificado(s)');
    const year = this.escape(String(pub.year ?? 'S/F'));
    const type = this.escape(pub.type || 'Publicación');
    const abstractText = this.escape(pub.abstract || 'Sin resumen.');

    return `
      <div class="mb-2"><strong>${title}</strong></div>
      <div class="small mb-2">${authors} · ${year} · ${type}</div>
      <p class="mb-0">${abstractText}</p>
    `;
  }

  private safeParsePub(raw: string): Pub {
    try {
      return JSON.parse(raw) as Pub;
    } catch {
      return { title: 'Sin título', file: this.fallbackPdf };
    }
  }

  private escape(s: string): string {
    return s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
