import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicacionesComponent } from './publicaciones';

describe('Publicaciones', () => {
  let component: PublicacionesComponent;
  let fixture: ComponentFixture<PublicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
