import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageGuard } from './page.guard';
import { MessagesComponent } from './components/messages.component';

const routes: Routes = [
    {path: 'messages', component: MessagesComponent, 
    canActivate: [PageGuard]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MessageRoutingModule { }
