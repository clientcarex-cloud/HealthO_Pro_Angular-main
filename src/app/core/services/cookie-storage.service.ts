import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import CryptoJS from 'crypto-js';
import { AlertService } from '@sharedcommon/service/alert.service';

const encryptionKey = '3ves4ao';

@Injectable({
  providedIn: 'root',
})
export class CookieStorageService {
  constructor(private alertSrvc: AlertService, private cookieService: CookieService) { }

  getUserType() {
    return parseInt(this.decrypt(this.cookieService.get('user_type')) || '0', 10)
  }

  getSpecificBooleanData(name: any) {
    return this.cookieService.get(name) ? JSON.parse(this.cookieService.get(name)) : true
  }

  is_sa_login(){
    return this.cookieService.get('sa_login') === 'true'
  }

  setSuperAdmin(data: any){

    this.clearCookieData();

    this.saveCookies(data, "superaccess");

    const idStr = data?.id.toString();
    this.cookieService.set('s_id', this.encrypt(idStr), undefined, '/');

    // Set the superadmin status with path '/'
    const isSuperAdminLoginStr = "true";
    this.cookieService.set('sa_login', isSuperAdminLoginStr, undefined, '/');

  }

  setCookieData(data: any): void {
    // Clear existing cookies to avoid duplicates
    this.clearCookieData();

    // Set the cookies for client_id, business_name, etc. with path '/'
    this.cookieService.set('client_id', data.client_id, undefined, '/');
    this.cookieService.set('business_name', data.business_name, undefined, '/');
    // this.cookieService.set('provider_type', data.provider_type, undefined, '/');
    this.cookieService.set('lab_staff_name', data.lab_staff_name, undefined, '/');
    this.cookieService.set('lab_staff_role', data.lab_staff_role, undefined, '/');

    this.cookieService.set('provider_type', this.encrypt(data.provider_type.toString()), undefined, '/');

    if (data.pro_user_id !== undefined && data.pro_user_id !== null) {
      const pro_user_idStr = data.pro_user_id.toString();
      const encrypted_pro_user_id = this.encrypt(pro_user_idStr);
      this.cookieService.set('pro_user_id', encrypted_pro_user_id, undefined, '/');
    }

    // Set the superadmin status with path '/'
    const isSuperAdminStr = data.is_superadmin.toString();
    this.cookieService.set('is_superadmin', isSuperAdminStr, undefined, '/');

    const b_idStr = data?.b_id.toString();
    this.cookieService.set('b_id', this.encrypt(b_idStr), undefined, '/');

    const user_typeStr = "3".toString();
    const encrypted_user_type = this.encrypt(user_typeStr);
    this.cookieService.set('user_type', encrypted_user_type, undefined, '/');

    // Encrypt and set lab_staff_id with path '/'
    const labStaffIdStr = data.lab_staff_id.toString();
    const encryptedLabStaffId = this.encrypt(labStaffIdStr);
    this.cookieService.set('lab_staff_id', encryptedLabStaffId, undefined, '/');

    // Encrypt and set client_id with path '/'
    const clientIdStr = data.client_id.toString();
    const encryptedClientId = this.encrypt(clientIdStr);
    this.cookieService.set('client_id', encryptedClientId, undefined, '/');

    // Set the superadmin status with path '/'
    const isSuperAdminLoginStr = "false";
    this.cookieService.set('sa_login', isSuperAdminLoginStr, undefined, '/');

    this.saveCookies(data, "access");

    this.setting(true, true);
  }


  saveCookies(data: any, accessName: any){
    // Encrypt and set the tokens with path '/'
    const encryptedRefresh = this.encrypt(data.refresh);
    const encryptedAccess = this.encrypt(data.access);

    this.cookieService.set('refresh', encryptedRefresh, undefined, '/');
    this.cookieService.set(accessName, encryptedAccess, undefined, '/');
  }

  getCookieData(): any {
    // Get the cookies and return them as an object
    return {
      client_id: parseInt(this.decrypt(this.cookieService.get('client_id')) || '0', 10),
      s_id: parseInt(this.decrypt(this.cookieService.get('s_id')) || '0', 10),
      b_id: parseInt(this.decrypt(this.cookieService.get('b_id')) || '0', 10),
      business_name: this.cookieService.get('business_name'),
      provider_type: parseInt(this.decrypt(this.cookieService.get('provider_type')) || '0', 10),
      lab_staff_id: parseInt(this.decrypt(this.cookieService.get('lab_staff_id')) || '0', 10),
      lab_staff_name: this.cookieService.get('lab_staff_name'),
      lab_staff_role: this.cookieService.get('lab_staff_role'),
      is_superadmin: this.cookieService.get('is_superadmin') === 'true', // convert string to boolean
      refresh: this.decrypt(this.cookieService.get('refresh')) || null,
      access: this.decrypt(this.cookieService.get('access')) || null,
      pro_user_id : parseInt(this.decrypt(this.cookieService.get('pro_user_id')) || '0', 10),
    };
  }

  
  setBusinessId(id: any){
    const user_typeStr = id.toString();
    const encrypted_user_type = this.encrypt(user_typeStr);
    this.cookieService.set('b_id', encrypted_user_type, undefined, '/');
  }

  getB_ID(){
    return parseInt(this.decrypt(this.cookieService.get('b_id')) || '0', 10)
  }

  setSuperadmin(data: any) {
    // Set the superadmin status with path '/'
    const isSuperAdminStr = data.is_superadmin.toString();
    this.cookieService.set('is_superadmin', isSuperAdminStr, undefined, '/');
  }


  setCookieDataForDoctor(data: any): void {
    if (!data) {
      return; // Exit function if data is undefined or null
    }

    // Clear existing cookies to avoid duplicates
    this.clearCookieData();

    // Encrypt and set the tokens with path '/'
    const encryptedRefresh = this.encrypt(data.refresh);
    const encryptedAccess = this.encrypt(data.access);

    this.cookieService.set('refresh', encryptedRefresh, undefined, '/');
    this.cookieService.set('access', encryptedAccess, undefined, '/');

    // Check if data.pro_user_id is defined before accessing its properties
    if (data.pro_user_id !== undefined && data.pro_user_id !== null) {
      const pro_user_idStr = data.pro_user_id.toString();
      const encrypted_pro_user_id = this.encrypt(pro_user_idStr);
      this.cookieService.set('pro_user_id', encrypted_pro_user_id, undefined, '/');
    }

    // Check if data.pro_doctor_id is defined before accessing its properties
    if (data.pro_doctor_id !== undefined && data.pro_doctor_id !== null) {
      const pro_doctor_idStr = data.pro_doctor_id.toString();
      const encrypted_pro_doctor_id = this.encrypt(pro_doctor_idStr);
      this.cookieService.set('pro_doctor_id', encrypted_pro_doctor_id, undefined, '/');
    }

    // Check if data.user_type is defined before accessing its properties
    if (data.user_type !== undefined && data.user_type !== null) {
      const user_typeStr = data.user_type.toString();
      const encrypted_user_type = this.encrypt(user_typeStr);
      this.cookieService.set('user_type', encrypted_user_type, undefined, '/');
    }
  }

  getDoctorCookiesData(): any {
    return {
      pro_user_id: parseInt(this.decrypt(this.cookieService.get('pro_user_id')) || '0', 10),
      pro_doctor_id: parseInt(this.decrypt(this.cookieService.get('pro_doctor_id')) || '0', 10),
      user_type: parseInt(this.decrypt(this.cookieService.get('user_type')) || '0', 10),
      refresh: this.decrypt(this.cookieService.get('refresh')) || null,
      access: this.decrypt(this.cookieService.get('access')) || null,
    };
  }

  getData(param: any){
    return parseInt(this.decrypt(this.cookieService.get(param)) || '0', 10)
  }

  setAccessToken(token: string): void {
    this.cookieService.set('access', this.encrypt(token));
  }

  getAccess(accessName: any = 'access'): string | null {
    return this.decrypt(this.cookieService.get(accessName)) || null;
  }

  getRefresh(): string | null {
    return this.decrypt(this.cookieService.get('refresh')) || null;
  }

  clearCookieData(): void {

    const path = '/'; // Set the path to match the one used for setting cookies
    const domain = ''; // Set the  if cookies were set with a specific domain
    this.cookieService.delete('client_id', path,);
    this.cookieService.delete('business_name', path,);
    this.cookieService.delete('business_name', path,);
    this.cookieService.delete('provider_type', path,);
    this.cookieService.delete('lab_staff_id', path,);
    this.cookieService.delete('lab_staff_name', path,);
    this.cookieService.delete('lab_staff_role', path,);
    this.cookieService.delete('is_superadmin', path,);
    this.cookieService.delete('is_active', path,);
    this.cookieService.delete('refresh', path,);
    this.cookieService.delete('access', path,);
    this.cookieService.delete('superaccess', path,);
    this.cookieService.delete('sa_login', path,);
    this.cookieService.delete('s_id', path,);

    const settingsData = this.getSetting();

    this.cookieService.deleteAll();

    this.setSetting(settingsData.api, settingsData.apr, settingsData.aprremark);

  }


  private encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, encryptionKey).toString();
  }

  private decrypt(encryptedValue: string): string {
    if (!encryptedValue) return '';

    const bytes = CryptoJS.AES.decrypt(encryptedValue, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  setting(i: any, r: any) {
    // Check if the cookies already exist
    const apiCookie = this.cookieService.get('api');
    const aprCookie = this.cookieService.get('apr');

    // Save the cookies only if they are not already present
    if (!apiCookie) {
      this.cookieService.set('api', i.toString(), undefined, '/');

    }
    if (!aprCookie) {
      this.cookieService.set('apr', r.toString(), undefined, '/');

    }
  }

  setSetting(i: any, r: any, rem: any) {
    this.cookieService.set('api', i.toString(), undefined, '/');
    this.cookieService.set('apr', r.toString(), undefined, '/');
    this.cookieService.set('aprremark', rem.toString(), undefined, '/');
  }

  getSetting() {
    return {
      api: this.cookieService.get('api') ? JSON.parse(this.cookieService.get('api')) : true,
      apr: this.cookieService.get('apr') ? JSON.parse(this.cookieService.get('apr')) : true,
      aprremark: this.cookieService.get('aprremark') ? JSON.parse(this.cookieService.get('aprremark')) : true,
    };
  }




  showedMessages(id: any, count: number) {
    // Retrieve current stored message string and counts from cookies
    let storedMsg = this.cookieService.get('MSG');
    let storedCounts = this.cookieService.get('COUNTS');
  
    // Parse counts from stored string to object or initialize empty object
    let counts = storedCounts ? JSON.parse(storedCounts) : {};
  
    // Check if the message ID is already stored
    if (!this.isMessageShown(storedMsg, id)) {
      // Append the new message ID to the existing string (if any)
      storedMsg = storedMsg ? `${storedMsg}:${id}` : id.toString();
  
      // Store the count for the message ID
      counts[id] = count;
  
      // Set the updated message string and counts object back to cookies
      this.cookieService.set('MSG', storedMsg, undefined, '/');
      this.cookieService.set('COUNTS', JSON.stringify(counts), undefined, '/');
  
      return false; // Return false to indicate message was not previously shown
    }
  
    // Check if count has increased since last shown
    if (counts[id] < count) {
      counts[id] = count;
      this.cookieService.set('COUNTS', JSON.stringify(counts), undefined, '/');
      return false; // Return false to indicate message count increased
    }
  
    return true; // Return true to indicate message was previously shown and count has not increased
  }
  

  private isMessageShown(storedMsg: string, messageId: any): boolean {
    if (!storedMsg) {
      return false;
    }

    const messageIds = storedMsg.split(':');
    return messageIds.includes(messageId.toString());
  }

  deleteMessageId(messageId: any,storedMsg: string = this.cookieService.get('MSG')): void {
    const messageIds = storedMsg.split(':');
    const index = messageIds.indexOf(messageId.toString());
    if (index !== -1) {
      messageIds.splice(index, 1);
      const updatedMsg = messageIds.join(':');
      this.cookieService.set('MSG', updatedMsg, undefined, '/');
    }
  }

  setPreview(e: any){
    this.cookieService.set('prv', e.toString(), undefined, '/');
  }

}
