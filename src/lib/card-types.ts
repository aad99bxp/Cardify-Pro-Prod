export interface ElementLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  visible: boolean;
}

export interface CardLayout {
  studentPhoto: ElementLayout;
  name: ElementLayout;
  class: ElementLayout;
  dob: ElementLayout;
  fatherName: ElementLayout;
  contact: ElementLayout;
  address: ElementLayout;
}

export interface BackCardLayout {
  fatherPhoto: ElementLayout;
  motherPhoto: ElementLayout;
  qrCode: ElementLayout;
  username: ElementLayout;
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
  dob?: string;
  fatherName?: string;
  contact?: string;
  address?: string;
  fatherphoto?: string;
  motherphoto?: string;
  link?: string;
  username?: string;
  qrCode?: string; // For passing generated QR to renderer
}
