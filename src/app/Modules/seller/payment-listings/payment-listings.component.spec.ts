import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentListingsComponent } from './payment-listings.component';

describe('PaymentListingsComponent', () => {
  let component: PaymentListingsComponent;
  let fixture: ComponentFixture<PaymentListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentListingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
