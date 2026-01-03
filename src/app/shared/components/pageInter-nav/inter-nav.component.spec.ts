import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterNavComponent } from './inter-nav.component';

describe('InterNavComponent', () => {
  let component: InterNavComponent;
  let fixture: ComponentFixture<InterNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InterNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InterNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
