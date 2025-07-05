
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

    if (cardType === 'front') {
        switch (key as keyof CardLayout) {
            case 'studentPhoto':
                content = <img src={convertDriveToLh3(frontData?.studentPhoto)} alt="Student" className="w-full h-full object-cover rounded-2xl" />;
                break;
            case 'name':
                content = <div className="text-black w-full h-full flex items-center justify-center"><strong style={{...headlineStyle, fontSize: `${elementLayout.fontSize! * scale}px` }}>{frontData?.name || '{name}'}</strong></div>;
                break;
            case 'class':
                 content = <div className="text-black w-full h-full flex items-center justify-start"><p style={{...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px`, backgroundColor: '#f5d85e', padding: `${2*scale}px ${4*scale}px`, borderRadius: `${4*scale}px`, display: 'inline-block' }}><strong>Class:</strong> {frontData?.class || '{class}'}</p></div>;
                 break;
            case 'dob':
                content = (
                    <div className="text-black w-full h-full flex items-center" style={{...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px`}}>
                        <strong style={{ width: '45%', textAlign: 'right', paddingRight: `${8 * scale}px` }}>D.O.B:</strong>
                        <span style={{ width: '55%', textAlign: 'left' }}>{frontData?.dob || '{dob}'}</span>
                    </div>
                );
                break;
            case 'fatherName':
                content = (
                    <div className="text-black w-full h-full flex items-center" style={{...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px`}}>
                        <strong style={{ width: '45%', textAlign: 'right', paddingRight: `${8 * scale}px` }}>Father's Name:</strong>
                        <span style={{ width: '55%', textAlign: 'left' }}>{frontData?.fatherName || '{fatherName}'}</span>
                    </div>
                );
                break;
            case 'contact':
                content = (
                    <div className="text-black w-full h-full flex items-center" style={{...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px`}}>
                        <strong style={{ width: '45%', textAlign: 'right', paddingRight: `${8 * scale}px` }}>Contact:</strong>
                        <span style={{ width: '55%', textAlign: 'left' }}>{frontData?.contact || '{contact}'}</span>
                    </div>
                );
                break;
            case 'address':
                content = (
                    <div className="text-black w-full h-full flex items-start" style={{...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px`}}>
                        <strong style={{ width: '45%', textAlign: 'right', paddingRight: `${8 * scale}px`, flexShrink: 0 }}>Address:</strong>
                        <span style={{ width: '55%', textAlign: 'left' }}>{frontData?.address || '{address}'}</span>
                    </div>
                );
                break;
            default:
                content = <span style={{fontSize: `${elementLayout.fontSize! * scale}px`}}>{frontData?.[key as keyof CardData] || `{${key}}`}</span>;
                break;
        }
    } else { // Back card
        switch (key as keyof BackCardLayout) {
            case 'fatherPhoto':
                content = <img src={convertDriveToLh3(frontData?.fatherphoto)} alt="Father" className="w-full h-full object-cover rounded-2xl" />;
                break;
            case 'motherPhoto':
                content = <img src={convertDriveToLh3(frontData?.motherphoto)} alt="Mother" className="w-full h-full object-cover rounded-2xl" />;
                break;
            case 'qrCode':
                content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" /> : null;
                break;
            case 'username':
                content = <div className="text-black w-full h-full flex items-center justify-center"><p style={{ ...bodyStyle, fontSize: `${elementLayout.fontSize! * scale}px` }}>{frontData?.username || '{username}'}</p></div>;
                break;
        }
    }
    
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
