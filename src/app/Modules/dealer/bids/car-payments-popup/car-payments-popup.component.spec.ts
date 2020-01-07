import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarPaymentsPopupComponent } from './car-payments-popup.component';

describe('CarPaymentsPopupComponent', () => {
  let component: CarPaymentsPopupComponent;
  let fixture: ComponentFixture<CarPaymentsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarPaymentsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarPaymentsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
