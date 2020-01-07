import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewYourDealershipPlanComponent } from './preview-your-dealership-plan.component';

describe('PreviewYourDealershipPlanComponent', () => {
  let component: PreviewYourDealershipPlanComponent;
  let fixture: ComponentFixture<PreviewYourDealershipPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewYourDealershipPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewYourDealershipPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
