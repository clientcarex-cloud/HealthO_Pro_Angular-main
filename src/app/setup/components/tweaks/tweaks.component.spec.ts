import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TweaksComponent } from './tweaks.component';

describe('TweaksComponent', () => {
  let component: TweaksComponent;
  let fixture: ComponentFixture<TweaksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TweaksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TweaksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
