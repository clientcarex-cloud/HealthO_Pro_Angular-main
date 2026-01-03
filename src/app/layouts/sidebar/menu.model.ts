export interface MenuItem {
  id?: number;
  label?: any;
  name?:any;
  icon?: string;
  link?: string;
  subItems?: any;
  isTitle?: boolean;
  badge?: any;
  parentId?: number;
  isLayout?: boolean;
  is_active?:boolean;
}