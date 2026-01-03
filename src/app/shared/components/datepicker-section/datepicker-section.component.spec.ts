import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerSectionComponent } from './datepicker-section.component';

describe('DatepickerSectionComponent', () => {
  let component: DatepickerSectionComponent;
  let fixture: ComponentFixture<DatepickerSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatepickerSectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatepickerSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
