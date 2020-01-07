import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DealershipViewComponent } from './dealership-view.component';

describe('DealershipViewComponent', () => {
  let component: DealershipViewComponent;
  let fixture: ComponentFixture<DealershipViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DealershipViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DealershipViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
