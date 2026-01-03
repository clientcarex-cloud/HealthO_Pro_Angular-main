import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CountryModel } from '../../models/country.model';
import { CountryService } from '../../services/country.service';
import { CountryEndpoint } from '../../endpoints/country.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  providers: [CountryService]
})
export class CountryComponent extends BaseComponent<CountryModel> {
  
  constructor(
    injector: Injector,
    public service: CountryService,
    private formBuilder: FormBuilder,
    private endPoint: CountryEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]]
    });
    
    this.dataList$ = this.service.countries$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.endPoint.getCountries().subscribe((data) => {
      this.service.countries = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add Country";
    } else {
      this.modalTitle = "Update Country";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('name')?.setValue(data.name);
  }

  /**
  * save country
  */
   override saveApiCall(): void {
    const name = this.baseForm.get('name')?.value;

    this.subsink.sink = this.endPoint.addCountry(name).subscribe((response) => {
      if (this.handleApiResponse(response, `Country (${name}) added successfully.`)) {
        this.service.addCountry("", name);
      }
    });
  }

   /**
  * update country
  */
   override updateApiCall(): void {  
    const name = this.baseForm.get('name')?.value;    

    this.subsink.sink = this.endPoint.updateCountry(name, this.oldItemName).subscribe((response) => {
      if (this.handleApiResponse(response, `Country (${name}) updated successfully.`)) {
        this.service.updateCountry(name, this.oldItemName);
      }
    });      
  }

  /**
  * Update country status
  */
  updateCountryStatus(data: any) {
    this.subsink.sink = this.endPoint.updateCountryStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `Country (${data.name}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

   /**
  * delete country
  */
   override deleteApiCall(model: any) {
    this.subsink.sink = this.endPoint.deleteCountry(model).subscribe((response) => {
      if (this.handleApiResponse(response, `Country (${model.name}) deleted successfully.`)) {
        this.service.deleteCountry(model.name);
      }
    });
  }
}
