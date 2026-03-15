export interface ElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface FontLayout {
  valueFontSize: number;
  labelFontSize: number;
  visible: boolean;
}

export interface CardLayout {
  studentPhoto: ElementLayout;
  name: ElementLayout & { valueFontSize: number };
  detailsGroup: ElementLayout;
  class: FontLayout;
  rollNo: FontLayout;
  section: FontLayout;
  dob: FontLayout;
  fatherName: FontLayout;
  motherName: FontLayout;
  admissionNo: FontLayout;
  contact: FontLayout;
  address: FontLayout & { height: number };
}

export interface BackCardLayout {
  fatherPhoto: ElementLayout;
  motherPhoto: ElementLayout;
  qrCode: ElementLayout;
  username: ElementLayout & { valueFontSize: number };
}

export type Layout = {
  front: CardLayout;
  back: BackCardLayout;
};

export type LayoutKey = keyof CardLayout;
export type BackLayoutKey = keyof BackCardLayout;

export interface CardData {
  [key: string]: string | undefined;
  studentPhoto?: string;
  name?: string;
  class?: string;
  rollNo?: string;
  section?: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  admissionNo?: string;
  contact?: string;
  address?: string;
  fatherphoto?: string;
  motherphoto?: string;
  link?: string;
  username?: string;
  qrCode?: string; // For passing generated QR to renderer
}
