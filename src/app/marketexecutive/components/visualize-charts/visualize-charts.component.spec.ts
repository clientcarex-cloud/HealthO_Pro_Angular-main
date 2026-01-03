import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeChartsComponent } from './visualize-charts.component';

describe('VisualizeChartsComponent', () => {
  let component: VisualizeChartsComponent;
  let fixture: ComponentFixture<VisualizeChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizeChartsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisualizeChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
