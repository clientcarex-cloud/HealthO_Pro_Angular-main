import { Component, EventEmitter, Injector, Input, Output, ViewChild, ViewChildren } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

import { LoyaltyCardEndpoint } from '../../loyaltycard.enpoint';
import { ProEndpoint } from 'src/app/patient/endpoints/pro.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { MembersComponent } from '../members/members.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-member-ship',
  templateUrl: './member-ship.component.html',
})

export class MemberShipComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private formBuilder: UntypedFormBuilder,
    private cookieSrvc: CookieStorageService,
    private endPoint: LoyaltyCardEndpoint,
    private proEndpoint: ProEndpoint,
    public timeSrvc: TimeConversionService
  ) { super(injector); }

  @Input() details: any ;

  @Output() updated: EventEmitter<any> = new EventEmitter<any>();
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  @ViewChildren(MembersComponent) membersComp!:MembersComponent;

  @ViewChild('popover3') pop: any ;

  cards: any;
  genders: any;
  members: any;
  relations: any;
  showTable: boolean = false;

  override ngOnInit(): void {
    this.initilizeForm();

    this.subsink.sink = this.endPoint.getCards("all", 1, "", true, "", "", "").subscribe((res: any)=>{
      this.cards = res.filter((card: any)=> card.is_active);

      this.cards?.forEach((card: any) =>{
        card.name = `${card.name} | ${card?.card_for?.name}`
      })
    });

    this.subsink.sink = this.proEndpoint.getGender().subscribe((data: any) => {
      this.genders = data.results;
      if(!this.details){ this.baseForm.get('gender')?.setValue(this.genders[0]); }
    });

    // this.subsink.sink = this.proEndpoint.getCardRelations().subscribe((data: any) => {
    //   this.relations = data;
    // });

    if(this.details){
      this.setForm();
    }
  }

  override ngOnDestroy(): void {
    this.details = null;
  }

  initilizeForm(){
    this.baseForm = this.formBuilder.group({
      card : [null, Validators.required],
      
      name: [null, Validators.required],
      dob: [null, Validators.required],
      gender: [null, Validators.required],

      mobile_number: [null, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      email: [null],

    })
  }

  setForm(){
    this.baseForm.patchValue({
      name : this.details.card_holder.name,
      dob: this.details.card_holder.dob,
      mobile_number: this.details.card_holder.mobile_number,
      card: this.details.card,
      gender: this.details.card_holder.gender,
      email: this.details?.card_holder?.email || null
    })

    this.cardSelected(this.details.card, this.pop);
    this.baseForm.get('card')?.disable();
  }

  getModel(){
    const model = {
      card_holder : {
        name: this.baseForm.get('name')?.value,
        dob: this.baseForm.get('dob')?.value,
        gender: this.baseForm.get('gender')?.value?.id,
        mobile_number: this.baseForm.get('mobile_number')?.value,
        profile_image: '',
        email: this.baseForm.get('email')?.value
      },
      card: this.baseForm.get('card')?.value?.id,
    }
    return model
  }

  

  saveMembership(){
    if(this.baseForm.valid){

      const model:any = this.getModel();

      if(this.details){
        model['created_by'] = this.details.created_by;
        model['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
        model['id'] = this.details.id ;
        this.updated.emit(model);
      }else{
        model['created_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
        model['last_updated_by'] = this.cookieSrvc.getCookieData().lab_staff_id;
        this.saved.emit(model);
      }
    }else{
      // this.alertService.showError("Please fill out all required fields.");
      this.showBaseFormErrors();
    }
  }




  card: any ;
  cardSelected(cardDetails: any, popContent: NgbPopover){  

    if(cardDetails){
      this.card = cardDetails ;
      if(popContent){
        setTimeout(()=>{
          popContent.open();
         },100)
      }
    }

    // this.showTable = false;

    // let array: any = [];

    // const maxMembersCount = card.card_for.max_members;
    // for (let i = 0; i < maxMembersCount; i++) {
    //   const mem = {
    //     profile_image: null,
    //     relation: null,
    //     name: '',
    //     dob: null,
    //     gender: null,
    //     mobile_number: null,
    //   };
    //   array.push(mem);
    // }

    // array[0].name = this.baseForm?.value?.name || '';
    // array[0].dob = this.baseForm?.value?.dob || null;
    // array[0].relation = 1 ;
    // array[0].mobile_number = this.baseForm?.value?.mobile_number || null;
    // array[0].gender = this.baseForm?.value?.gender?.id || null

    // this.members = array;
    // this.showTable = true;

  }

}
