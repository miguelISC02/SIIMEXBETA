import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

type RegistroForm = {
  nombre: FormControl<string>;
  apellido_paterno: FormControl<string>;
  apellido_materno: FormControl<string>;
  fecha_nacimiento: FormControl<string>; // ISO string del input date
  correo: FormControl<string>;
  telefono: FormControl<string>;
  nombre_usuario: FormControl<string>;
  contrasena: FormControl<string>;
  genero: FormControl<string>;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
})
export class RegistroComponent {
  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);

  // ✅ Tipado fuerte y sin nullables, sin error de "fb before init"
  form: FormGroup<RegistroForm> = this.fb.group({
    nombre: this.fb.control('', { validators: [Validators.required] }),
    apellido_paterno: this.fb.control('', { validators: [Validators.required] }),
    apellido_materno: this.fb.control('', { validators: [Validators.required] }),
    fecha_nacimiento: this.fb.control('', { validators: [Validators.required] }),
    correo: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    telefono: this.fb.control('', { validators: [Validators.required] }),
    nombre_usuario: this.fb.control('', { validators: [Validators.required] }),
    contrasena: this.fb.control('', { validators: [Validators.required] }),
    genero: this.fb.control('', { validators: [Validators.required] }),
  });

  validarRegistro() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigateByUrl('/registro/step2');
  }
}
