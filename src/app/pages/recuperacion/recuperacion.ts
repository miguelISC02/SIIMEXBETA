import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-recuperacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recuperacion.html',
  styleUrls: ['./recuperacion.css'],
})
export class RecuperacionComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Defer para que el DOM esté listo con Vite/HMR
    requestAnimationFrame(() => this.initBrowserOnlyHandlers());
  }

  private initBrowserOnlyHandlers(): void {
    const $ = <T extends HTMLElement>(id: string) =>
      document.getElementById(id) as T | null;

    // --- Elements
    const email = $('email') as HTMLInputElement | null;
    const curp  = $('curp')  as HTMLInputElement | null;
    const rfc   = $('rfc')   as HTMLInputElement | null;
    const idHint = $('idHint');

    const pw   = $('pw')  as HTMLInputElement | null;
    const pw2  = $('pw2') as HTMLInputElement | null;
    const pwBar = $('pwBar') as HTMLDivElement | null;
    const pwToggle = $('pwToggle') as HTMLButtonElement | null;

    const submitBtn = $('submitBtn') as HTMLButtonElement | null;
    const resetBtn  = $('resetBtn')  as HTMLButtonElement | null;
    const formStatus = $('formStatus');

    const reqLen = $('rLen');
    const reqUp  = $('rUpper');
    const reqLo  = $('rLower');
    const reqNum = $('rNum');
    const reqSym = $('rSym');

    // --- Regex
    const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const reCurp  = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]{2}$/i;
    const reRfc   = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

    const val = (el: HTMLInputElement | null) => el?.value ?? '';

    // --- Helpers
    const validateIDs = () => {
      let ok = 0;
      if (val(email) && reEmail.test(val(email))) ok++;
      if (val(curp)  && reCurp.test(val(curp)))   ok++;
      if (val(rfc)   && reRfc.test(val(rfc)))     ok++;
      idHint && (idHint.textContent = ok >= 2
        ? 'Identificadores suficientes.'
        : 'Proporciona al menos dos identificadores válidos.');
      return ok >= 2;
    };

    const scorePassword = (v: string) => {
      const sLen = v.length >= 8 ? 1 : 0;
      const sUp  = /[A-Z]/.test(v) ? 1 : 0;
      const sLo  = /[a-z]/.test(v) ? 1 : 0;
      const sNum = /\d/.test(v)    ? 1 : 0;
      const sSym = /[^A-Za-z0-9]/.test(v) ? 1 : 0;

      reqLen?.classList.toggle('ok', !!sLen);
      reqUp?.classList.toggle('ok',  !!sUp);
      reqLo?.classList.toggle('ok',  !!sLo);
      reqNum?.classList.toggle('ok', !!sNum);
      reqSym?.classList.toggle('ok', !!sSym);

      const points = sLen + sUp + sLo + sNum + sSym; // 0..5
      if (pwBar) {
        const pct = [0,25,50,75,100][Math.min(points,4)];
        pwBar.style.width = pct + '%';
        pwBar.classList.remove('w1','w2','w3','w4');
        if (points <= 1) pwBar.classList.add('w1');
        else if (points === 2) pwBar.classList.add('w2');
        else if (points === 3) pwBar.classList.add('w3');
        else pwBar.classList.add('w4');
      }
      return points >= 4;
    };

    const validateMatch = () =>
      !!val(pw) && val(pw) === val(pw2);

    const recompute = () => {
      const idsOk = validateIDs();
      const pwOk  = scorePassword(val(pw));
      const match = validateMatch();

      pw2?.classList.toggle('is-invalid', !!val(pw2) && !match);

      const ready = idsOk && pwOk && match;
      if (submitBtn) submitBtn.disabled = !ready;

      if (formStatus) {
        formStatus.textContent = ready
          ? 'Listo para enviar.'
          : 'Completa requisitos: dos identificadores válidos, contraseña fuerte y confirmación idéntica.';
      }
    };

    // --- Listeners
    [email, curp, rfc, pw, pw2].forEach(el => el?.addEventListener('input', recompute));

    pwToggle?.addEventListener('click', () => {
      if (!pw || !pw2) return;
      const type = pw.type === 'password' ? 'text' : 'password';
      pw.type = type; pw2.type = type;
    });

    submitBtn?.addEventListener('click', () => {
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      if (formStatus) formStatus.textContent = 'Procesando…';
      // Aquí iría tu llamada real a la API
      setTimeout(() => {
        if (formStatus) formStatus.textContent = 'Contraseña actualizada. Revisa tu correo para confirmación.';
      }, 900);
    });

    resetBtn?.addEventListener('click', () => {
      if (formStatus) formStatus.textContent = '';
      if (pwBar) {
        pwBar.style.width = '0%';
        pwBar.classList.remove('w1','w2','w3','w4');
      }
      [reqLen,reqUp,reqLo,reqNum,reqSym].forEach(e=>e?.classList.remove('ok'));
      if (submitBtn) submitBtn.disabled = true;
    });

    // Primer cálculo
    recompute();
  }
}
