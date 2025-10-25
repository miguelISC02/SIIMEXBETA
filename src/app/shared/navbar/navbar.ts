// src/app/shared/navbar/navbar.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <- necesario para *ngIf
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  mostrarNavbar = true;

  // rutas donde NO se muestra el navbar
  private hiddenRoutes = ['/login', '/registro', '/registro-step2','/recuperacion'];

  constructor(private router: Router) {
    // chequeo inicial (por si ya entraste directo a una ruta oculta)
    this.mostrarNavbar = !this.hiddenRoutes.some(r => this.router.url.startsWith(r));
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects as string;
        this.mostrarNavbar = !this.hiddenRoutes.some(r => url.startsWith(r));
      });
  }
}
