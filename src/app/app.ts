import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';                 // ← para *ngIf
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// SIN ".component": tus archivos son navbar.ts y footer.ts
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  showChrome = true;
  private hiddenRoutes = ['/login', '/registro', '/registro-step2','/recuperacion'];

  constructor(private router: Router) {
    // chequeo inicial
    this.showChrome = !this.hiddenRoutes.some(r => this.router.url.startsWith(r));
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects as string;
        this.showChrome = !this.hiddenRoutes.some(r => url.startsWith(r));
      });
  }
}
