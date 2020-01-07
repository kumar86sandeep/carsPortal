import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodAlertComponent } from './payment-method-alert.component';

describe('PaymentMethodAlertComponent', () => {
  let component: PaymentMethodAlertComponent;
  let fixture: ComponentFixture<PaymentMethodAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentMethodAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMethodAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
