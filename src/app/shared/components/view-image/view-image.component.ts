import { Component, Inject, Injector, Input } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-view-image',
  template: `
    <div class="modal-header py-1 px-3 bg-soft-primary border-bottom d-flex justify-content-between align-items-center">
      <span class="modal-title fs-5" id="modal-basic-title">{{title}}</span>
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
    </div>
    <div class="modal-body">
      <div class="container-full">

          <div class="row">
              <div class="col-12 d-flex justify-content-center">
                  <img [src]="image ? image : ''" style="height: 400px; width: 400px; object-fit: contain;">
              </div>
          </div>
      </div>
    </div>
  `,
})

export class ViewImageComponent extends BaseComponent<any> {

  @Input() image: any = '' ;
  @Input() title : string = 'Prescription' ;

  constructor(injector: Injector){ super(injector) }

  dismiss(){
    this.modalService.dismissAll();
  }
}
