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
    if (data?.link && cardType === 'back') {
      QRCode.toDataURL(data.link, { width: 300 }).then(setQrCodeUrl);
    } else {
      setQrCodeUrl('');
    }
  }, [data, cardType]);

  const renderElement = (key: LayoutKey | BackLayoutKey, elementLayout: ElementLayout) => {
    if (!elementLayout.visible) return null;

    let content: React.ReactNode;
    let placeholder: string = key.toString();
    
    const frontData = data as CardData;
    const backData = data as CardData & { qrCode: string };

    if (cardType === 'front' && 'studentPhoto' in layout && key === 'studentPhoto') {
        content = <img src={convertDriveToLh3(frontData?.studentPhoto)} alt="Student" className="w-full h-full object-cover" />;
        placeholder = "Student Photo";
    } else if (cardType === 'back' && 'fatherPhoto' in layout && key === 'fatherPhoto') {
        content = <img src={convertDriveToLh3(backData?.fatherphoto)} alt="Father" className="w-full h-full object-cover" />;
        placeholder = "Father Photo";
    } else if (cardType === 'back' && 'motherPhoto' in layout && key === 'motherPhoto') {
        content = <img src={convertDriveToLh3(backData?.motherphoto)} alt="Mother" className="w-full h-full object-cover" />;
        placeholder = "Mother Photo";
    } else if (cardType === 'back' && 'qrCode' in layout && key === 'qrCode') {
        content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-cover" /> : null;
        placeholder = "QR Code";
    } else {
        content = <span style={{fontSize: `${elementLayout.fontSize! * (PREVIEW_WIDTH / 637)}px`}}>{frontData?.[key as keyof CardData] || `{${key}}`}</span>
        placeholder = `{${key}}`;
    }

    return (
      <EditableElement
        key={key}
        id={`${id}-${key}`}
        layout={elementLayout}
        onUpdate={(newLayout) => onLayoutChange(key, newLayout)}
        scale={PREVIEW_WIDTH / 637}
        containerRef={containerRef}
      >
        {content}
      </EditableElement>
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
