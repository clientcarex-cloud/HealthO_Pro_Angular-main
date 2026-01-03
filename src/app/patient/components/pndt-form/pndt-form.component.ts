import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { AddPatientEndpoint } from '../../endpoints/addpatient.endpoint';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { CaptilizeService } from '@sharedcommon/service/captilize.service';
import { DoctorEndpoint } from 'src/app/doctor/endpoint/doctor.endpoint';
import { error } from 'console';

@Component({
  selector: 'app-pndt-form',
  templateUrl: './pndt-form.component.html',
  styleUrl: './pndt-form.component.scss'
})

export class PndtFormComponent extends BaseComponent<any> {
  
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private endPoint: AddPatientEndpoint,
    private doctorEndpoint: DoctorEndpoint,
    private masterEndpoint: MasterEndpoint,
    public timeSrvc: TimeConversionService,
    private cookieSrvc: CookieStorageService,
    private printSrvc: PrintService,
    public capitalSrvc: CaptilizeService,
  ){ super( injector) }

  @Input() ptn !: any ;
  @Input() organization: any ;
  @Input() titles: any ;

  @Output() savedNames: EventEmitter<any> = new EventEmitter<any>();
  @Output() savedAddress: EventEmitter<any> = new EventEmitter<any>();

  pndtDetails: any = {
    show: true,
    doctors: '',
    docs: '',
    reg_num: '',
    lic_num: '',
    addresses: []
  }

  putPNDT: boolean = false ;

  isLoading: boolean = false ;

  PNDT_file: any;

  consultingDoctors!: any;

  hospitalName: string = "";

  showPNDT: boolean = false;
  savePrintPNDT: any = null;
  submitPNDT: boolean = false;
  PNDTFormGroup!: UntypedFormGroup;



  override ngOnInit(): void {
    const staffData = this.cookieSrvc.getCookieData();
    this.hospitalName = staffData.business_name;
    
    this.openPNDT()
  }

  openPNDT() {

    this.isLoading = true ;

    this.subsink.sink = this.endPoint.getPNDTReport(this.ptn.id).subscribe((rpt: any) => {
      if (rpt.count === 1) {
        this.putPNDT = true;
        this.PNDT_file = rpt.results[0];
        this.initializePNDTForm(rpt.results[0]);
      } else {
        this.putPNDT = false;
        this.initializePNDTForm({})
      }

      this.getDefaultPNDTDocs();
    }, (error)=>{
      this.isLoading = false ;
    });

  }

  
  getDefaultPNDTDocs(){
    this.subsink.sink = this.masterEndpoint.getPNDTDetails().subscribe((data: any) => {

      this.isLoading = false ;

      if (data.length != 0) {
        if (data[0].is_active && data[0].default_pndt_doctors.length !== 0) {
          this.pndtDetails.docs = [];
          let names = '';

          let lic_num = ''
          data[0].default_pndt_doctors.forEach((d: any) => {
            names += ' / ' + d.name;
            lic_num += ' / ' + (d?.license_number ? d?.license_number : 'NA')
            this.pndtDetails.docs.push(d.id)
          })

          names = names.substring(2);
          lic_num = lic_num.substring(2);

          this.pndtDetails.doctors = names;
          this.pndtDetails.lic_num = lic_num
          this.pndtDetails.reg_num = data[0].pndt_reg_number;
          this.pndtDetails.show = !data[0].is_active;

          this.PNDTFormGroup.get('doctor')?.setValue(this.pndtDetails.docs);
        }
      }

      this.setPNDTAdditionalData();
      
    }, (error)=>{

      this.setPNDTAdditionalData();
      this.isLoading = false ;
    })
  
  }

  setPNDTAdditionalData(){
    this.pndtDetails.addresses = this.organization.addresses;
    this.PNDTFormGroup.get('addresses')?.setValue(this.organization.addresses);
    this.PNDTFormGroup.get('clinic_details')?.setValue(this.organization.addresses[0]);
  }

  initializePNDTForm(data: any) {

    this.PNDTFormGroup = this.formBuilder.group({
      addresses: [],

      clinic_details: [data?.procedures_performed?.clinic_details || null],

      prenatal_diagnostic_procedure: [data?.prenatal_diagnostic_procedure || 'NOT APPLICABLE'],
      ultrasonography_results: [data?.ultrasonography_results || 'NOT APPLICABLE'],
      date_consent_obtained: [data?.date_consent_obtained || null],
      date_procedures_carried_out: [data?.date_procedures_carried_out || null],
      results_conveyed_to: [data?.results_conveyed_to || 'NOT APPLICABLE'],
      results_conveyed_on: [data?.results_conveyed_on || null],

      clinical_history: [data?.family_genetic_history?.clinical_history || 'NOT APPLICABLE'],
      biochemical_history: [data?.family_genetic_history?.biochemical_history || 'NOT APPLICABLE'],
      cytogenetic_history: [data?.family_genetic_history?.cytogenetic_history || 'NOT APPLICABLE'],
      other_history: [data?.family_genetic_history?.other_history || 'NOT APPLICABLE'],

      chromosomal_disorders: [data?.prenatal_screening?.chromosomal_disorders || 'NOT APPLICABLE'],
      metabolic_disorders: [data?.prenatal_screening?.metabolic_disorders || 'NOT APPLICABLE'],
      congenital_anomalies: [data?.prenatal_screening?.congenital_anomalies || 'NOT APPLICABLE'],
      intellectual_disabilities: [data?.prenatal_screening?.intellectual_disabilities || 'NOT APPLICABLE'],
      hemoglobinopathies: [data?.prenatal_screening?.hemoglobinopathies || 'NOT APPLICABLE'],
      sex_linked_disorders: [data?.prenatal_screening?.sex_linked_disorders || 'NOT APPLICABLE'],
      single_gene_disorders: [data?.prenatal_screening?.single_gene_disorders || 'NOT APPLICABLE'],
      other_disorders: [data?.prenatal_screening?.other_disorders || 'NOT APPLICABLE'],
      maternal_age: [data?.prenatal_screening?.maternal_age || 'NOT APPLICABLE'],
      last_menstrual_period: [data?.prenatal_screening?.last_menstrual_period || 'NOT APPLICABLE'],
      family_genetic_history: [data?.prenatal_screening?.family_genetic_history || 'NOT APPLICABLE'],
      other_information: [data?.prenatal_screening?.other_information || 'NOT APPLICABLE'],

      mtp_performed_by: [data?.mtp_info?.mtp_performed_by || 'NOT APPLICABLE'],
      date_mtp_performed: [data?.mtp_info?.date_mtp_performed || 'NOT APPLICABLE'],
      mtp_advised_by: [data?.mtp_info?.mtp_advised_by || 'NOT APPLICABLE'],
      mtp_advised_date: [data?.mtp_info?.mtp_advised_date || 'NOT APPLICABLE'],
      place_mtp: [data?.mtp_info?.place_mtp || 'NOT APPLICABLE'],

      registration_number: [data?.mtp_info?.registration_number || 'NOT APPLICABLE'],
      mtp_registration_number: [data?.mtp_info?.pndt_number || 'NOT APPLICABLE'],
      pndt_number: [data?.mtp_info?.pndt_number || 'NOT APPLICABLE'],
      chromosomal_studies: [data?.recommended_tests?.chromosomal_studies || 'NOT APPLICABLE'],
      biochemical_studies: [data?.recommended_tests?.biochemical_studies || 'NOT APPLICABLE'],
      molecular_studies: [data?.recommended_tests?.molecular_studies || 'NOT APPLICABLE'],
      pre_implantation_genetic_diagnosis: [data?.recommended_tests?.pre_implantation_genetic_diagnosis || 'NOT APPLICABLE'],

      doctor: [null],

      ultrasound_test_purpose: [data?.procedures_performed?.ultrasound_test_purpose || 'NOT APPLICABLE'],
      complications: [data?.procedures_performed?.complications || 'NOT APPLICABLE'],

      male_children_count: [data?.family_genetic_history?.male_children_count || 0],
      female_children_count: [data?.family_genetic_history?.female_children_count || 0],

      father_name: [data?.family_genetic_history?.father_name || null],
      husband_name: [data?.family_genetic_history?.husband_name || null]

    });
    // doctor: [data?.procedures_performed?.doctor || 'NOT APPLICABLE'],

    // this.doctorEndpoint.getSingleDoctor(data?.procedures_performed?.doctor).subscribe((data: any) => {
    //   this.PNDTFormGroup.get('doctor')?.setValue(data);
    // })


  }


  resetPNDTForm() {
    this.PNDTFormGroup?.reset();

  }

  getPNDTModel(ptn: any = this.ptn.id) {

    const model = {
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
      patient: ptn,
      prenatal_diagnostic_procedure: this.PNDTFormGroup.get('prenatal_diagnostic_procedure')?.value || 'NOT APPLICABLE',
      ultrasonography_results: this.PNDTFormGroup.get('ultrasonography_results')?.value || 'NOT APPLICABLE',
      date_consent_obtained: this.PNDTFormGroup.get('date_consent_obtained')?.value || 'NOT APPLICABLE',
      date_procedures_carried_out: this.PNDTFormGroup.get('date_procedures_carried_out')?.value || 'NOT APPLICABLE',
      results_conveyed_to: this.PNDTFormGroup.get('results_conveyed_to')?.value || 'NOT APPLICABLE',
      results_conveyed_on: this.PNDTFormGroup.get('results_conveyed_on')?.value || 'NOT APPLICABLE',
      family_genetic_history: {
        patient: ptn,
        clinical_history: this.PNDTFormGroup.get('clinical_history')?.value || 'NOT APPLICABLE',
        biochemical_history: this.PNDTFormGroup.get('biochemical_history')?.value || 'NOT APPLICABLE',
        cytogenetic_history: this.PNDTFormGroup.get('cytogenetic_history')?.value || 'NOT APPLICABLE',
        other_history: this.PNDTFormGroup.get('other_history')?.value || 'NOT APPLICABLE',
        male_children_count: this.PNDTFormGroup.get('male_children_count')?.value || 0,
        female_children_count: this.PNDTFormGroup.get('female_children_count')?.value || 0,
        father_name: this.PNDTFormGroup.get('father_name')?.value || '',
        husband_name: this.PNDTFormGroup.get('husband_name')?.value || ''

      },
      prenatal_screening: {
        patient: ptn,
        chromosomal_disorders: this.PNDTFormGroup.get('chromosomal_disorders')?.value || 'NOT APPLICABLE',
        metabolic_disorders: this.PNDTFormGroup.get('metabolic_disorders')?.value || 'NOT APPLICABLE',
        congenital_anomalies: this.PNDTFormGroup.get('congenital_anomalies')?.value || 'NOT APPLICABLE',
        intellectual_disabilities: this.PNDTFormGroup.get('intellectual_disabilities')?.value || 'NOT APPLICABLE',
        hemoglobinopathies: this.PNDTFormGroup.get('hemoglobinopathies')?.value || 'NOT APPLICABLE',
        sex_linked_disorders: this.PNDTFormGroup.get('sex_linked_disorders')?.value || 'NOT APPLICABLE',
        single_gene_disorders: this.PNDTFormGroup.get('single_gene_disorders')?.value || 'NOT APPLICABLE',
        other_disorders: this.PNDTFormGroup.get('other_disorders')?.value || 'NOT APPLICABLE',
        maternal_age: this.PNDTFormGroup.get('maternal_age')?.value || 'NOT APPLICABLE',
        last_menstrual_period: this.PNDTFormGroup.get('last_menstrual_period')?.value || 'NOT APPLICABLE',
        family_genetic_history: this.PNDTFormGroup.get('family_genetic_history')?.value || 'NOT APPLICABLE',
        other_information: this.PNDTFormGroup.get('other_information')?.value || 'NOT APPLICABLE',
      },
      mtp_info: {
        patient: ptn,
        mtp_performed_by: this.PNDTFormGroup.get('mtp_performed_by')?.value || 'NOT APPLICABLE',
        date_mtp_performed: this.PNDTFormGroup.get('date_mtp_performed')?.value || 'NOT APPLICABLE',
        mtp_advised_by: this.PNDTFormGroup.get('mtp_advised_by')?.value || 'NOT APPLICABLE',
        mtp_advised_date: this.PNDTFormGroup.get('mtp_advised_date')?.value || 'NOT APPLICABLE',
        registration_number: this.PNDTFormGroup.get('mtp_registration_number')?.value || 'NOT APPLICABLE',
        pndt_number: this.PNDTFormGroup.get('pndt_number')?.value || 'NOT APPLICABLE',
        place_mtp: this.PNDTFormGroup.get('place_mtp')?.value || 'NOT APPLICABLE',
      },
      recommended_tests: {
        patient: ptn,
        chromosomal_studies: this.PNDTFormGroup.get('chromosomal_studies')?.value || 'NOT APPLICABLE',
        biochemical_studies: this.PNDTFormGroup.get('biochemical_studies')?.value || 'NOT APPLICABLE',
        molecular_studies: this.PNDTFormGroup.get('molecular_studies')?.value || 'NOT APPLICABLE',
        pre_implantation_genetic_diagnosis: this.PNDTFormGroup.get('pre_implantation_genetic_diagnosis')?.value || 'NOT APPLICABLE',
      },
      procedures_performed: {
        patient: ptn,
        doctors: !this.pndtDetails.show ? this.pndtDetails.docs : [this.PNDTFormGroup.get('doctor')?.value?.id],
        clinic_details: this.PNDTFormGroup.get('clinic_details')?.value?.id,
        registration_number: this.PNDTFormGroup.get('registration_number')?.value || 'NOT APPLICABLE',
        pndt_number: this.PNDTFormGroup.get('pndt_number')?.value || 'NOT APPLICABLE',
        ultrasound_test_purpose: this.PNDTFormGroup.get('ultrasound_test_purpose')?.value || 'NOT APPLICABLE',
        complications: this.PNDTFormGroup.get('complications')?.value || 'NOT APPLICABLE',
      }
    }

    return model
  }


  postPNDTForm(ptn: any, next = false) {

    const model = this.getPNDTModel(ptn);
    if (!this.putPNDT) {

      this.subsink.sink = this.endPoint.postPNDT(model).subscribe((data: any) => {
        const pndtModel = {
          patient_id: ptn,
          client_id: this.cookieSrvc.getCookieData().client_id
        }

        this.subsink.sink = this.endPoint.printPNDT(pndtModel).subscribe((res: any) => {
          this.savePrintPNDT ? this.printSrvc.printer(res?.html_content,false, false, 500) : this.alertService.showSuccess("PNDT Details Saved");
          this.modalService.dismissAll()
          this.savePrintPNDT = null;

        }, (error) => {
          this.alertService.showError("Failed to Fetch PNDT Form", "Please Try Again to Print",)
        })
      })
    } else {
      this.subsink.sink = this.endPoint.putPNDT(model, this.PNDT_file.id).subscribe((data: any) => {
        const pndtModel = {
          patient_id: ptn,
          client_id: this.cookieSrvc.getCookieData().client_id
        }
        this.subsink.sink = this.endPoint.printPNDT(pndtModel).subscribe((res: any) => {
          this.savePrintPNDT ? this.printSrvc.printer(res?.html_content, false, false) : this.alertService.showSuccess("PNDT Details Saved");
          this.savePrintPNDT = null;
          this.modalService.dismissAll()
        }, (error) => {
          this.alertService.showError("Failed to Fetch PNDT Form", "Please Try Again to Print",)
        })
      })
    }
  }

  getConsultingDocs(searchTerm: any) {
    while (searchTerm.startsWith(" ")) {
      searchTerm = searchTerm.substring(1);
    }

    if (searchTerm) {
      this.doctorEndpoint.getPaginatedConsultingDoctors(
        "all", 1, searchTerm, "", "", "", false
      ).subscribe((data: any) => {
        this.consultingDoctors = data;
      })
    }
  }


  printPNDT() {

    const pndtModel = {
      patient_id: this.ptn.id,
      client_id: this.cookieSrvc.getCookieData().client_id,
      printed_by: this.cookieSrvc.getCookieData().lab_staff_id,
    }

    this.subsink.sink = this.endPoint.printPNDT(pndtModel).subscribe((res: any) => {
      this.printSrvc.printer(res?.html_content || "", false, false)
    }, (error) => {
      this.alertService.showError("Failed to Fetch PNDT Form", "Please Try Again to Print",)
    })
  }




  // utilities 

  writeAttenderName(id: number, e: any) {

    // this.isCollapsed = false;

    if (id == 2) {
      this.PNDTFormGroup.get('father_name')?.setValue(this.capitalSrvc.AutoName(e.replace(/[^a-zA-Z.\s]/g, '')))
    } else {
      this.PNDTFormGroup.get('husband_name')?.setValue(this.capitalSrvc.AutoName(e.replace(/[^a-zA-Z.\s]/g, '')))
    }

    const model = {
      attender_relationship_title: id,
      attender_name: this.capitalSrvc.AutoName(e)
    }
    this.savedNames.emit(model);
  }

  enterAddress(e: any) {
    // this.baseForm.get('address')?.setValue(e);
    this.savedAddress.emit(e)
  }


  getTitleName(id: any) {
    return this.titles.find((t: any) => t.id == this.ptn?.title)?.name
  }

  dismissModal(){
    this.modalService.dismissAll();
  }

  togglePrint() {
    const doc = this.PNDTFormGroup.get('doctor')?.value;
    const father_name = this.PNDTFormGroup.get('father_name')?.value;
    const husband_name = this.PNDTFormGroup.get('husband_name')?.value
    const attender = father_name || husband_name

    if (doc !== null && (father_name || husband_name)) {
      this.savePrintPNDT = true;
      this.postPNDTForm(this.ptn.id)
    } else {
      this.submitPNDT = true;

      doc === null ? this.alertService.showError("Please choose Doctor in the 11th section of the PNDT Form.") : null
      !attender ? this.alertService.showError("Please enter Husband's/Father name in the 5th section of the PNDT Form.") : null;
    }
  
  }

}
