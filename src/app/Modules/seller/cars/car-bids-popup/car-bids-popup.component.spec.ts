import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBidsPopupComponent } from './car-bids-popup.component';

describe('CarBidsPopupComponent', () => {
  let component: CarBidsPopupComponent;
  let fixture: ComponentFixture<CarBidsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarBidsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarBidsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
