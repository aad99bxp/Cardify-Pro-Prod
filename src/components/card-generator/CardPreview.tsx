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
}

const CARD_ASPECT_RATIO = 1016 / 637; // height/width
const PREVIEW_WIDTH = 382.2; // 60% of 637

const fieldLabels: Partial<Record<LayoutKey | BackLayoutKey, string>> = {
  class: 'Class:',
  dob: 'D.O.B:',
  fatherName: "Father's Name:",
  contact: 'Contact:',
  address: 'Address:',
};

const detailFields: (keyof CardLayout)[] = ['class', 'dob', 'fatherName', 'contact', 'address'];
const positionableElementKeys = ['studentPhoto', 'name', 'detailsGroup', 'fatherPhoto', 'motherPhoto', 'qrCode', 'username'];

export function CardPreview({ id, bg, layout, onLayoutChange, data, cardType }: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const convertDriveToLh3 = (link: string | undefined): string => {
    if (!link) return "https://placehold.co/250x250/EBF5FB/7f8c8d?text=Photo";
    if (link.includes("drive.google.com")) {
      const fileId = link.split('/d/')[1]?.split('/')[0];
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
    const detailsLayout = layout as CardLayout;
    let yOffset = 0;

    return detailFields.map(key => {
      const fontLayout = detailsLayout[key as keyof CardLayout] as FontLayout & { height?: number };
      if (!fontLayout.visible) return null;

      const fieldHeight = (key === 'address' ? fontLayout.height! : 40) * scale;
      const value = data?.[key] || `{${key}}`;

      const element = (
        <div
          key={key}
          className="w-full flex"
          style={{
            position: 'absolute',
            top: `${yOffset}px`,
            height: `${fieldHeight}px`,
            fontFamily: "'PT Sans', sans-serif",
            color: 'black',
            alignItems: 'flex-start',
            ...(key === 'class' && { backgroundColor: '#FEF9C3' })
          }}
        >
          <div className="w-1/2 text-right pr-2 font-bold" style={{ fontSize: `${fontLayout.labelFontSize * scale}px` }}>
            {fieldLabels[key as keyof typeof fieldLabels]}
          </div>
          <div className="w-1/2 text-left" style={{ fontSize: `${fontLayout.valueFontSize * scale}px` }}>
            {value}
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
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {renderDetailsGroup(scale)}
        </div>
      );
    } else if (key === 'name') {
      content = (
        <div className="text-black w-full h-full flex items-center justify-center" style={{ ...headlineStyle, fontSize: `${elementLayout.valueFontSize * scale}px` }}>
          <strong>{data?.name || '{name}'}</strong>
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
          content = <img src={convertDriveToLh3(data?.studentPhoto)} alt="Student" className="w-full h-full object-cover rounded-2xl" />;
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
          className="relative bg-muted-foreground/20 overflow-hidden"
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
