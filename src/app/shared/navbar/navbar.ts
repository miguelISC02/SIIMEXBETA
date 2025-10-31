// src/app/shared/navbar/navbar.ts
import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Renderer2 } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  mostrarNavbar = true;

  private hiddenRoutes = ['/login', '/registro', '/registro-step2', '/recuperacion'];
  private isBrowser = false;
  private unlistenScroll: (() => void) | null = null;

  @ViewChild('navbarEl', { static: false }) navbarEl!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // estado inicial por si se entra directo a una ruta oculta
    this.mostrarNavbar = !this.hiddenRoutes.some(r => this.router.url.startsWith(r));

    // actualiza visibilidad al navegar
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: any) => {
        this.mostrarNavbar = !this.hiddenRoutes.some(r => urlAfterRedirects.startsWith(r));
      });
  }

  ngOnInit() {
    // nada de DOM aquí
  }

  ngAfterViewInit() {
    if (!this.isBrowser || !this.navbarEl) return;

    const onScroll = () => {
      const scrolled = window.scrollY > 6;
      if (scrolled) {
        this.renderer.addClass(this.navbarEl.nativeElement, 'scrolled');
      } else {
        this.renderer.removeClass(this.navbarEl.nativeElement, 'scrolled');
      }
    };

    // primer cálculo
    onScroll();

    // registra listener y guarda la función de limpieza
    this.unlistenScroll = this.renderer.listen('window', 'scroll', onScroll);
  }

  ngOnDestroy() {
    if (this.unlistenScroll) {
      this.unlistenScroll();
      this.unlistenScroll = null;
    }
  }
}
