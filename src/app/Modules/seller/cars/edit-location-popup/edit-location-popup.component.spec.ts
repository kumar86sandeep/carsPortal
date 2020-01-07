import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLocationPopupComponent } from './edit-location-popup.component';

describe('EditLocationPopupComponent', () => {
  let component: EditLocationPopupComponent;
  let fixture: ComponentFixture<EditLocationPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLocationPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLocationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
