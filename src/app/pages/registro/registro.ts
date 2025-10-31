import {
  Component,
  ChangeDetectionStrategy,
  Inject,
  OnInit,
  PLATFORM_ID,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  FormControl,
} from '@angular/forms';

/* =======================
   Validadores personalizados
   ======================= */
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/; // simplificado (ajústalo si necesitas más estricto)

function curpValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '').toUpperCase().trim();
  if (!v) return null;
  return CURP_REGEX.test(v) ? null : { curp: true };
}

function phoneValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '').replace(/\D/g, '');
  if (!v) return null;
  return v.length >= 10 ? null : { phone: true };
}

function strongPassword(ctrl: AbstractControl): ValidationErrors | null {
  const v = (ctrl.value || '') as string;
  if (!v) return null;
  const ok = v.length >= 8 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /\d/.test(v);
  return ok ? null : { weak: true };
}

// Mock async para “email ya registrado”
function fakeEmailCheck(email: string): Promise<boolean> {
  return new Promise((res) =>
    setTimeout(() => res(email.toLowerCase().includes('test@')), 500)
  );
}

/* =======================
   Tipado del formulario
   ======================= */
type RegistroForm = FormGroup<{
  nombre: FormControl<string>;
  apellidoPaterno: FormControl<string>;
  apellidoMaterno: FormControl<string>;
  fechaNacimiento: FormControl<string>;
  correo: FormControl<string>;
  telefono: FormControl<string>;
  curp: FormControl<string>;
  genero: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistroComponent implements OnInit {
  /* Inyección sin constructor (evita TS2729) */
  private fb = inject(FormBuilder);

  /* Estado UI */
  isBrowser = false;
  submitting = signal(false);
  emailTaken = signal(false);
  pwdVisible = signal(false);

  today = new Date().toISOString().slice(0, 10);
  minDate = '1900-01-01';

  /* Formulario tipado + nonNullable (para usar f.nombre en template) */
  form: RegistroForm = this.fb.nonNullable.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(60)]),
    apellidoPaterno: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(60)]),
    apellidoMaterno: this.fb.nonNullable.control(''),
    fechaNacimiento: this.fb.nonNullable.control(''),
    correo: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    telefono: this.fb.nonNullable.control('', [phoneValidator]),
    curp: this.fb.nonNullable.control('', [curpValidator]),
    genero: this.fb.nonNullable.control(''),
    password: this.fb.nonNullable.control('', [Validators.required, strongPassword]),
  });

  /** Alias para usar punto en la plantilla: f.nombre, f.curp, etc. */
  readonly f = this.form.controls;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private doc: Document
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // CURP en mayúsculas
    this.f.curp.valueChanges.subscribe((v) => {
      if (v && v !== v.toUpperCase()) {
        this.f.curp.setValue(v.toUpperCase(), { emitEvent: false });
      }
    });

    // Chequeo async de email ya registrado (debounce simple)
    let t: any;
    this.f.correo.valueChanges.subscribe(async (v) => {
      this.emailTaken.set(false);
      if (!v || this.f.correo.invalid) return;
      clearTimeout(t);
      t = setTimeout(async () => {
        const taken = await fakeEmailCheck(v);
        this.emailTaken.set(taken);
        if (taken) this.f.correo.setErrors({ ...(this.f.correo.errors || {}), taken: true });
        else if (this.f.correo.hasError('taken')) {
          const errs = { ...(this.f.correo.errors || {}) };
          delete (errs as any)['taken'];
          this.f.correo.setErrors(Object.keys(errs).length ? errs : null);
        }
      }, 350);
    });
  }

  private focusFirstInvalid(): void {
    if (!this.isBrowser) return;
    const firstInvalidKey = Object.keys(this.form.controls).find(
      (k) => (this.form.controls as any)[k].invalid
    );
    if (!firstInvalidKey) return;
    const el = this.doc.querySelector(
      `[data-control="${firstInvalidKey}"]`
    ) as HTMLElement | null;
    el?.focus();
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  passwordStrength(): 'fuerte' | 'media' | 'débil' | '' {
    const v = this.f.password.value || '';
    if (!v) return '';
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v) || /[^A-Za-z0-9]/.test(v)) score++;
    return score >= 3 ? 'fuerte' : score === 2 ? 'media' : 'débil';
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    this.submitting.set(true);
    await new Promise((res) => setTimeout(res, 900)); // simula backend
    this.submitting.set(false);
    alert('Registro enviado ✅'); // reemplaza por navegación/toast
  }
}
