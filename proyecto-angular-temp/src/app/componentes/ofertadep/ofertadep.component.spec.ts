import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertadepComponent } from './ofertadep.component';

describe('OfertadepComponent', () => {
  let component: OfertadepComponent;
  let fixture: ComponentFixture<OfertadepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertadepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertadepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
