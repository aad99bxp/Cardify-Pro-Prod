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
}

export interface TextElementLayout extends ElementLayout, FontLayout {
  textAlign: 'left' | 'center' | 'right';
}

export interface CardLayout {
  studentPhoto: ElementLayout & {
    borderColor: string;
    borderWidth: number;
  };
  name: TextElementLayout & {
    highlightColor: string;
    textColor: string;
  };
  class: TextElementLayout & {
    highlightColor: string;
  };
  rollNo: TextElementLayout;
  section: TextElementLayout;
  dob: TextElementLayout;
  fatherName: TextElementLayout;
  motherName: TextElementLayout;
  admissionNo: TextElementLayout;
  contact: TextElementLayout;
  address: TextElementLayout;
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
