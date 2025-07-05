
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { EditableElement } from './EditableElement';
import { CardContent, Card } from '@/components/ui/card';
import type { CardLayout, BackCardLayout, ElementLayout, LayoutKey, BackLayoutKey, CardData } from '@/lib/card-types';
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

  const renderElement = (key: LayoutKey | BackLayoutKey, elementLayout: ElementLayout) => {
    if (!elementLayout.visible) return null;

    let content: React.ReactNode;
    const scale = PREVIEW_WIDTH / 637;
    const headlineStyle = { fontFamily: "'Poppins', sans-serif" };
    const bodyStyle = { fontFamily: "'PT Sans', sans-serif" };

    const frontData = data as CardData;
    const isEditable = !elementLayout.valueFontSize;

    if (elementLayout.valueFontSize) {
      const label = fieldLabels[key];
      if (key === 'name') {
        content = (
          <div className="text-black w-full h-full flex items-center justify-center" style={{ ...headlineStyle, fontSize: `${elementLayout.valueFontSize * scale}px` }}>
            <strong>{frontData?.name || '{name}'}</strong>
          </div>
        );
      } else if (key === 'username') {
        content = (
          <div className="text-black w-full h-full flex items-center justify-center" style={{ ...bodyStyle, fontSize: `${elementLayout.valueFontSize * scale}px` }}>
            {frontData?.username || '{username}'}
          </div>
        );
      } else if (label) {
        const value = frontData?.[key as keyof CardData] || `{${key}}`;
        content = (
          <div className="flex w-full h-full items-start" style={bodyStyle}>
            <div className="w-[45%] text-right pr-2 font-bold" style={{ fontSize: `${elementLayout.labelFontSize! * scale}px` }}>
              {label}
            </div>
            <div className="w-[55%] text-left" style={{ fontSize: `${elementLayout.valueFontSize * scale}px` }}>
              {value}
            </div>
          </div>
        );
      }
    } else {
      switch (key) {
        case 'studentPhoto':
          content = <img src={convertDriveToLh3(frontData?.studentPhoto)} alt="Student" className="w-full h-full object-cover rounded-2xl" />;
          break;
        case 'fatherPhoto':
          content = <img src={convertDriveToLh3(frontData?.fatherphoto)} alt="Father" className="w-full h-full object-cover rounded-2xl" />;
          break;
        case 'motherPhoto':
          content = <img src={convertDriveToLh3(frontData?.motherphoto)} alt="Mother" className="w-full h-full object-cover rounded-2xl" />;
          break;
        case 'qrCode':
          content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" /> : null;
          break;
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

    return (
      <div
        key={key}
        id={`${id}-${key}`}
        style={{
          top: `${elementLayout.y * scale}px`,
          left: `${elementLayout.x * scale}px`,
          width: `${elementLayout.width * scale}px`,
          height: `${elementLayout.height * scale}px`,
        }}
        className="absolute flex items-center"
      >
        {content}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-[calc(100vw-4rem)] md:max-w-md lg:max-w-lg shadow-lg">
      <CardContent className="p-4">
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
            Object.entries(layout).map(([key, elementLayout]) => renderElement(key as LayoutKey | BackLayoutKey, elementLayout))
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
