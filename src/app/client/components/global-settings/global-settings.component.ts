import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { ClientEndpoint } from '../../clients.endpoint';

@Component({
  selector: 'app-global-settings',
  templateUrl: './global-settings.component.html',
  styleUrl: './global-settings.component.scss'
})

export class GlobalSettingsComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: ClientEndpoint
  ){ super(injector) }

  override ngOnInit(): void {
    
  }
  
}
