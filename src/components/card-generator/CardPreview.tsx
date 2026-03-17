
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { EditableElement } from './EditableElement';
import { CardContent, Card } from '@/components/ui/card';
import type { CardLayout, BackCardLayout, ElementLayout, LayoutKey, BackLayoutKey, CardData, FontLayout } from '@/lib/card-types';
import { ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';


interface CardPreviewProps {
  id: string;
  bg: string | null;
  layout: CardLayout | BackCardLayout;
  onLayoutChange: (key: LayoutKey | BackLayoutKey, newLayout: Partial<ElementLayout>) => void;
  data: CardData | null;
  cardType: 'front' | 'back';
  detailFieldsOrder?: (keyof CardLayout)[];
}

const CARD_ASPECT_RATIO = 1016 / 637;
const PREVIEW_WIDTH = 324;

const fieldLabels: Partial<Record<LayoutKey | BackLayoutKey, string>> = {
  class: 'Class:',
  rollNo: 'Roll No.:',
  section: 'Section:',
  dob: 'D.O.B:',
  fatherName: "Father's Name:",
  motherName: "Mother's Name:",
  admissionNo: 'Admission No.:',
  contact: 'Contact:',
  address: 'Address:',
};

const positionableElementKeys = ['studentPhoto', 'name', 'detailsGroup', 'fatherPhoto', 'motherPhoto', 'qrCode', 'username'];

export function CardPreview({ id, bg, layout, onLayoutChange, data, cardType, detailFieldsOrder }: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const convertDriveToLh3 = (link: string | undefined): string => {
    if (!link) return "https://placehold.co/250x250/EBF5FB/7f8c8d?text=Photo";
    if (link.includes("drive.google.com")) {
      const fileIdMatch = link.match(/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      return fileId ? `https://lh3.googleusercontent.com/d/${fileId}=s400` : link;
    }
    return link;
  };
  
  useEffect(() => {
    if (data?.qrCode) {
      setQrCodeUrl(data.qrCode);
    } else if (data?.link && cardType === 'back') {
      QRCode.toDataURL(data.link, { width: 300 }).then(setQrCodeUrl);
    } else {
      setQrCodeUrl('');
    }
  }, [data, cardType]);

  const renderDetailsGroup = (scale: number) => {
    if (!detailFieldsOrder) return null;
    const detailsLayout = layout as CardLayout;
    let yOffset = 0;

    return detailFieldsOrder.map(key => {
      const fontLayout = detailsLayout[key as keyof CardLayout] as FontLayout & { height?: number };
      if (!fontLayout.visible) return null;

      const fieldHeight = ((key === 'address' ? fontLayout.height! : 40) * detailsLayout.detailsGroup.lineHeight) * scale;
      const value = data?.[key as keyof CardData] || `{${key}}`;

      const element = (
        <div
          key={key}
          style={{
            position: 'absolute',
            top: `${yOffset}px`,
            width: '100%',
            height: `${fieldHeight}px`,
            fontFamily: "'PT Sans', sans-serif",
            color: 'black',
            textAlign: detailsLayout.detailsGroup.textAlign,
          }}
        >
          <div className="inline-flex" style={{ height: '100%', alignItems: key === 'address' ? 'flex-start' : 'center' }}>
            <div style={{
              display: 'flex',
              height: '100%',
              alignItems: key === 'address' ? 'flex-start' : 'center',
              backgroundColor: key === 'class' ? (detailsLayout.class as any).highlightColor : 'transparent',
              padding: key === 'class' ? `0 ${8 * scale}px` : '0',
              borderRadius: key === 'class' ? '8px' : '0',
              boxSizing: 'border-box',
            }}>
              <div className="w-1/2 text-right pr-2 font-bold" style={{ fontSize: `${fontLayout.labelFontSize * scale}px`, whiteSpace: 'nowrap' }}>
                {fieldLabels[key as keyof typeof fieldLabels]}
              </div>
              <div className="w-1/2 text-left pl-2" style={{ fontSize: `${fontLayout.valueFontSize * scale}px` }}>
                {value}
              </div>
            </div>
          </div>
        </div>
      );
      yOffset += fieldHeight;
      return element;
    });
  };

  const renderElement = (key: LayoutKey | BackLayoutKey, elementLayout: any) => {
    if (!elementLayout.visible) return null;

    let content: React.ReactNode;
    const scale = PREVIEW_WIDTH / 637;
    const headlineStyle = { fontFamily: "'Poppins', sans-serif" };
    
    const isEditable = positionableElementKeys.includes(key as string);

    if (key === 'detailsGroup') {
      content = (
        <div style={{ position: 'relative', width: '100%', height: '100%'}}>
          {renderDetailsGroup(scale)}
        </div>
      );
    } else if (key === 'name') {
      content = (
        <div className="flex items-center" style={{ 
            ...headlineStyle,
            width: '100%',
            height: '100%',
            justifyContent: elementLayout.textAlign === 'left' ? 'flex-start' : elementLayout.textAlign === 'right' ? 'flex-end' : 'center',
            fontSize: `${elementLayout.valueFontSize * scale}px`,
            color: elementLayout.textColor,
          }}>
          <span style={{
            backgroundColor: elementLayout.highlightColor,
            padding: '0 8px',
            borderRadius: '8px',
          }}>
            <strong style={{width: '100%'}}>{data?.name || '{name}'}</strong>
          </span>
        </div>
      );
    } else if (key === 'username') {
      const bodyStyle = { fontFamily: "'PT Sans', sans-serif" };
      content = (
        <div className="text-black w-full h-full flex items-center justify-center" style={{ ...bodyStyle, fontSize: `${elementLayout.valueFontSize * scale}px` }}>
          {data?.username || '{username}'}
        </div>
      );
    } else {
      switch (key) {
        case 'studentPhoto':
          content = <img src={convertDriveToLh3(data?.studentPhoto)} alt="Student" className="w-full h-full object-cover object-top rounded-2xl" style={{ border: `${elementLayout.borderWidth * scale}px solid ${elementLayout.borderColor}`, boxSizing: 'border-box' }} />;
          break;
        case 'fatherPhoto':
          content = <img src={convertDriveToLh3(data?.fatherphoto)} alt="Father" className="w-full h-full object-cover rounded-2xl" />;
          break;
        case 'motherPhoto':
          content = <img src={convertDriveToLh3(data?.motherphoto)} alt="Mother" className="w-full h-full object-cover rounded-2xl" />;
          break;
        case 'qrCode':
          content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" /> : null;
          break;
        default:
          return null;
      }
    }
    
    if (isEditable) {
      return (
        <EditableElement
          key={key}
          id={`${id}-${key}`}
          layout={elementLayout}
          onUpdate={(newLayout) => onLayoutChange(key, newLayout)}
          scale={scale}
          containerRef={containerRef}
        >
          {content}
        </EditableElement>
      );
    }

    // Should not be reached for movable elements
    return null;
  };

  const positionableElements = Object.entries(layout).filter(([key]) =>
    positionableElementKeys.includes(key)
  );

  return (
    <Card className="w-full max-w-[calc(100vw-4rem)] md:max-w-md lg:max-w-lg shadow-lg">
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="relative bg-muted-foreground/20"
          style={{
            width: `${PREVIEW_WIDTH}px`,
            height: `${PREVIEW_WIDTH * CARD_ASPECT_RATIO}px`,
            backgroundImage: `url(${bg})`,
            backgroundSize: '100% 100%',
          }}
        >
          {bg ? (
            positionableElements.map(([key, elementLayout]) => renderElement(key as LayoutKey | BackLayoutKey, elementLayout))
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col text-muted-foreground">
              <ImageIcon className="w-16 h-16" />
              <p className="mt-2 font-semibold">Upload a background</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
