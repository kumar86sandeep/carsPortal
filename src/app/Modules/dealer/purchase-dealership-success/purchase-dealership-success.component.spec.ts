import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDealershipSuccessComponent } from './purchase-dealership-success.component';

describe('PurchaseDealershipSuccessComponent', () => {
  let component: PurchaseDealershipSuccessComponent;
  let fixture: ComponentFixture<PurchaseDealershipSuccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseDealershipSuccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseDealershipSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
