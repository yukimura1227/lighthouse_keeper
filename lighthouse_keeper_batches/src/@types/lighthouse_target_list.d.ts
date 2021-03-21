declare module 'lighthouse_target_list.json' {
  // generate from https://jvilk.com/MakeTypes/
  export interface lighthouse_target_list {
    protocol: string;
    domain: string;
    target_list: (TargetListEntity)[];
  }
  export interface TargetListEntity {
    key?: string;
    url: string;
    desktop: boolean;
    mobile: boolean;
  }
  export const lighthouse_target_list: lighthouse_target_list;
}