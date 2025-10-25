import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  year = new Date().getFullYear(); // usar propiedad, no "new Date()" en el template
}
