import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnifyComponent } from './magnify.component';

describe('MagnifyComponent', () => {
  let component: MagnifyComponent;
  let fixture: ComponentFixture<MagnifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagnifyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MagnifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
