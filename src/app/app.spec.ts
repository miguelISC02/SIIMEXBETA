import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app'; // asegúrate que exporta esta clase

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render app container', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Revisa que exista algo del template, por ejemplo el navbar
    expect(compiled.querySelector('app-navbar')).not.toBeNull();
  });
});
