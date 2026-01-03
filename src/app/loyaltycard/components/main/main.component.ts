import { Component, Injector, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { LoyaltycardComponent } from '../loyaltycard/loyaltycard.component';

import { MembersComponent } from '../members/members.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private endPoint: LoyaltyCardEndpoint,
    public timeSrvc: TimeConversionService
  ) {
    super(injector);
  }

  @ViewChild(LoyaltycardComponent) cardComp!: LoyaltycardComponent;
  @ViewChild(MembersComponent) membersComp!: MembersComponent;

  // strings
  title: any = "";

  override ngOnInit(): void {

  }

  openXl(content: any, sz: string = 'lg', cntrd: boolean = true, title: string) {
    this.title = title;
    this.modalService.open(content, { size: sz, centered: cntrd, scrollable: true, keyboard: true });
  }

  saveCard(model: any) {
    if(model?.id){
      this.updateCard(model);
    }else{
      this.subsink.sink = this.endPoint.postCard(model).subscribe((res: any) => {
        this.alertService.showSuccess(`${model.name} Card Saved.`);
        this.modalService.dismissAll();
        this.cardComp.getData();
  
      }, (error) => {
        this.alertService.showError(error?.error?.Error || error?.error?.error || error) ;
      });
    }

  }


  updateCard(model: any) {

    this.subsink.sink = this.endPoint.updateCard(model.id, model).subscribe((res: any) => {
      this.alertService.showSuccess(`${model.name} Card Details Updated.`);
      this.modalService.dismissAll();
      this.cardComp.getData();

    }, (error) => {

      this.alertService.showError("Error saving card. Please try again.", error?.error?.Error || error?.error?.error || error);
    });
  }

  saveMember(model : any){
    this.subsink.sink = this.endPoint.postMembership(model).subscribe((res: any) => {
      this.alertService.showSuccess(`${model.card_holder.name} Membership Saved.`);
      this.modalService.dismissAll();

      this.membersComp.getData();
      
    }, (error) => {

      this.alertService.showError("Error saving card. Please try again.", error?.error?.Error || error?.error?.error || error);
    });
  }


}
