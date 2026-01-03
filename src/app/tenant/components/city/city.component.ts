import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CityModel } from '../../models/city.model';
import { CityService } from '../../services/city.service';
import { CityEndpoint } from '../../endpoints/city.endpoint';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { StateEndpoint } from '../../endpoints/state.endpoint';
import { StateModel } from '../../models/state.model';

@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss'],
  providers: [CityService]
})
export class CityComponent extends BaseComponent<CityModel> {

  constructor(
    injector: Injector,
    public service: CityService,
    private formBuilder: FormBuilder,
    private endPoint: CityEndpoint,
    private stateEndpoint: StateEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      state: ['', [Validators.required]]
    });

    this.dataList$ = this.service.cities$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.endPoint.getCities().subscribe((data) => {
      this.service.cities = data;
    });

    this.stateEndpoint.getStates().subscribe((data) => {
      this.states = data;
    });
  }

  override clearData(): void {
    this.country = "";

    if (this.isNewRecord) {
      this.modalTitle = "Add City";
    } else {
      this.modalTitle = "Update City";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('name')?.setValue(data.name);
    this.baseForm.get('state')?.setValue(data.state);
    this.country = data.state?.country?.name;
  }

  /**
  * save city
  */
  override saveApiCall(): void {
    const name = this.baseForm.get('name')?.value;
    const state = this.baseForm.get('state')?.value;

    this.subsink.sink = this.endPoint.addCity(name, state).subscribe((response) => {
      if (this.handleApiResponse(response, `City (${name}) added successfully.`)) {
        this.service.addCity("", name, state);
      }
    });
  }

  /**
  * update city
  */
  override updateApiCall(): void {
    const name = this.baseForm.get('name')?.value;
    const state = this.baseForm.get('state')?.value;

    this.subsink.sink = this.endPoint.updateCity(name, this.oldItemName, state).subscribe((response) => {
      if (this.handleApiResponse(response, `City (${name}) updated successfully.`)) {
        this.service.updateCity(name, this.oldItemName, state);
      }
    });
  }

  /**
  * Update city status
  */
   updateCityStatus(data: any) {
    this.subsink.sink = this.endPoint.updateCityStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `City (${data.name}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  override deleteApiCall(model: any) {
    this.subsink.sink = this.endPoint.deleteCity(model).subscribe((response) => {
      if (this.handleApiResponse(response, `City (${model.name}) deleted successfully.`)) {
        this.service.deleteCity(model.name);
      }
    });
  }

  /**
  * Loading states
  */
  country: string = "";
  states: StateModel[] = [];
  stateChange(state: any) {
    this.country = state?.country?.name ?? "";
  }
}
