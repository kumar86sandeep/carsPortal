import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDealershipComponent } from './purchase-dealership.component';

describe('PurchaseDealershipComponent', () => {
  let component: PurchaseDealershipComponent;
  let fixture: ComponentFixture<PurchaseDealershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurchaseDealershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseDealershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
