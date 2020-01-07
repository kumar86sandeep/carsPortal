import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateCarComponent } from './deactivate-car.component';

describe('DeactivateCarComponent', () => {
  let component: DeactivateCarComponent;
  let fixture: ComponentFixture<DeactivateCarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeactivateCarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeactivateCarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
