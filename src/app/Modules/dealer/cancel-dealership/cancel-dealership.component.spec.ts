import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelDealershipComponent } from './cancel-dealership.component';

describe('CancelDealershipComponent', () => {
  let component: CancelDealershipComponent;
  let fixture: ComponentFixture<CancelDealershipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelDealershipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelDealershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
