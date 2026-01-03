import { Injectable, Injector } from "@angular/core";
import { BaseEndpoint } from "src/app/shared/base/base.endpoint";
// import { NablResponse } from "../model/nablreponse.model";
import { CookieStorageService } from "src/app/core/services/cookie-storage.service";

@Injectable({ providedIn: 'root' })

export class MessageEndpoint extends BaseEndpoint {
    
     constructor(injector: Injector, cookieSrvc: CookieStorageService) {
        super(injector, cookieSrvc); 
        this.route = "messaging";
    }

    getunreadMessagesCount(){
        return this.getData<any>({ action: `total_messages_count` , params: ''});
    }

    checkMessageUser(id:any){
        // let reqParams = `page_size=all`
        return this.getData<any>({ action: `check_message_user/${id}/` , params: ''});
    }

    getUsers(){
        let reqParams = `page_size=all`
        return this.getData<any>({ action: "user_list_create"});
    }

    getMessages(e: any = '', page_size: any = 'all'){
        let reqParams = `${e && e!= '' ? '&username=' + e : ''}&page_size=${page_size}`
        return this.getData<any>({ action: "combined_chat", params: reqParams});
    }


    getChat(id:any, page_size: any, page_number: any){
        let reqParams = `page_size=${page_size}&page=${page_number}`
        return this.getData<any>({ action: `message_list_in_convo/${id}`, params: reqParams});
    }

    getGroupChat(id:any, page_size: number, page_number: any){
        let reqParams = `page_size=${page_size}&page=${page_number}`
        return this.getData<any>({ action: `message_list_in_group/${id}`, params: reqParams});
    }

    getUsersSearch(e:any){
        let reqParams = `${e != "" ? 'username='+e : ''}&page_size=all`
        return this.getData<any>({ action: `user_search`, params: reqParams});  
    }



    // post urls 

    postUser(model:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `user_list_create`, body: reqBody, });
    }

    postMessage(model:any, id:any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `message_list_in_convo/${id}`, body: reqBody, });
    }

    postMessageInGroup(model:any, id: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `message_list_in_group/${id}`, body: reqBody, });
    }

    postSeenStatus(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `user_read_confirmation_chat`, body: reqBody, });
    }

    postSeenStatusInGroup(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `user_read_confirmation_group`, body: reqBody, });
    }

    postInitialConvo(model: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `start_personal_chat`, body: reqBody, });
    }

    postIntialGroupConvo(model : any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `group_list_create`, body: reqBody, });
    }

    postRemoveMemberInGroup(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `remove_members_in_group/${id}`, body: reqBody, });
    }

    postSelfRemove(model: any, id: any){
        const reqBody = JSON.stringify({});
        return this.deleteData({ action: `remove_self_in_group/${id}`, body: reqBody, });
    }

    postAddMemberInGroup(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `add_members_to_group/${id}`, body: reqBody, });
    }

    postRemoveAdminsInGroup(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `remove_admin_access/${id}`, body: reqBody, });
    }

    postAddAdmin(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.postData({ action: `give_admin_access/${id}`, body: reqBody, });
    }

    updateGroupName(model:any, id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `group_edit/${id}/`, body: reqBody, });
    }

    updateUserDetails(model: any, id: any){
        const reqBody = JSON.stringify(model);
        return this.PutModelRequest({ action: `user_edit/${id}/`, body: reqBody, });
    }
}


