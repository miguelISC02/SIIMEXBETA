import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  FormControl
} from '@angular/forms';

/* ===== Validadores de archivos ===== */
function fileRequired(ctrl: AbstractControl): ValidationErrors | null {
  const f = ctrl.value as File | null;
  return f ? null : { requiredFile: true };
}
function fileMaxSizeMB(maxMB: number) {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const f = ctrl.value as File | null;
    if (!f) return null;
    return f.size <= maxMB * 1024 * 1024 ? null : { maxSize: { maxMB, size: f.size } };
  };
}
function fileAccept(acceptList: string[]) {
  const norm = acceptList.map(a => a.trim().toLowerCase());
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const f = ctrl.value as File | null;
    if (!f) return null;
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const mimeOk = !!f.type && norm.includes(f.type.toLowerCase());
    const extOk = norm.includes('.' + ext);
    return (mimeOk || extOk) ? null : { accept: { allow: acceptList, got: f.type || '.' + ext } };
  };
}

/* ===== RFC ===== */
const RFC_REGEX = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{2,3}$/;
function rfcValidator(ctrl: AbstractControl): ValidationErrors | null {
  const raw = ctrl.value as string | null;
  const v = (raw || '').toUpperCase().replace(/[-\s]/g, '');
  if (!v) return { required: true };
  return RFC_REGEX.test(v) ? null : { rfc: true };
}

/* ===== Tipado ===== */
type Step2Form = FormGroup<{
  cvFile: FormControl<File | null>;
  rfcNum: FormControl<string | null>;
  fiscalPdf: FormControl<File | null>;
  domicilio: FormControl<File | null>;
  cert1: FormControl<File | null>;
  cert2: FormControl<File | null>;
}>;
type FileKeys = 'cvFile' | 'fiscalPdf' | 'domicilio' | 'cert1' | 'cert2';

@Component({
  selector: 'app-registro-step2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro-step2.html',
  styleUrls: ['./registro-step2.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistroStep2Component {
  private fb = inject(FormBuilder);
  readonly MAX_MB = 10;
  showCerts = false;

  // === Estado para el highlight de dropzones (lo usa el template con dragging()==='...') ===
  private _dragging: FileKeys | null = null;
  dragging(): FileKeys | null { return this._dragging; }

  form: Step2Form = this.fb.group({
    cvFile: this.fb.control<File | null>(null, [
      fileRequired, fileMaxSizeMB(this.MAX_MB), fileAccept(['.pdf', 'application/pdf'])
    ]),
    rfcNum: this.fb.control<string | null>(null, [rfcValidator]),
    fiscalPdf: this.fb.control<File | null>(null, [
      fileRequired, fileMaxSizeMB(this.MAX_MB), fileAccept(['.pdf', 'application/pdf'])
    ]),
    domicilio: this.fb.control<File | null>(null, [
      fileRequired,
      fileMaxSizeMB(this.MAX_MB),
      fileAccept(['.pdf','.jpg','.jpeg','.png','application/pdf','image/jpeg','image/png'])
    ]),
    cert1: this.fb.control<File | null>(null, [
      fileMaxSizeMB(this.MAX_MB),
      fileAccept(['.pdf','.jpg','.jpeg','.png','application/pdf','image/jpeg','image/png'])
    ]),
    cert2: this.fb.control<File | null>(null, [
      fileMaxSizeMB(this.MAX_MB),
      fileAccept(['.pdf','.jpg','.jpeg','.png','application/pdf','image/jpeg','image/png'])
    ]),
  });

  /** Alias para f.cvFile, f.rfcNum, etc. */
  f = this.form.controls;

  constructor() {
    // Normaliza RFC a mayúsculas y sin separadores
    this.f.rfcNum.valueChanges.subscribe(v => {
      const norm = (v || '').toUpperCase().replace(/[-\s]/g, '');
      if (v !== norm) this.f.rfcNum.setValue(norm, { emitEvent: false });
    });
  }

  /* ===== Drag & drop helpers (firmas que espera tu HTML) ===== */
  onInputFile(e: Event, key: FileKeys) {
    const input = e.target as HTMLInputElement;
    const file: File | null = input.files?.[0] ?? null;
    (this.f[key] as FormControl<File | null>).setValue(file);
    (this.f[key] as FormControl<File | null>).markAsTouched();
  }

  onDrop(e: DragEvent, key: FileKeys) {
    e.preventDefault();
    e.stopPropagation();
    const file: File | null = e.dataTransfer?.files?.[0] || null;
    (this.f[key] as FormControl<File | null>).setValue(file);
    (this.f[key] as FormControl<File | null>).markAsTouched();
    this._dragging = null;
  }

  onDragOver(e: DragEvent, key: FileKeys) {
    e.preventDefault();
    this._dragging = key;
  }

  onDragLeave() { this._dragging = null; }

  clearFile(key: FileKeys) {
    (this.f[key] as FormControl<File | null>).setValue(null);
    (this.f[key] as FormControl<File | null>).markAsTouched();
  }

  humanSize(bytes?: number) {
    if (bytes == null) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  }

  /* ===== Navegación demo (sin modales) ===== */
  saveDraft(ev?: Event) {
    ev?.preventDefault();
    window.location.assign('/landing');
  }

  submit(ev?: Event) {
    ev?.preventDefault();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    window.location.assign('/landing');
  }
}
