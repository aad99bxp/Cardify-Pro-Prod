"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import type { CardData, CardLayout, BackCardLayout, LayoutKey, BackLayoutKey, FontLayout } from '@/lib/card-types';
import QRCode from 'qrcode';

interface IdCardRendererProps {
  cardType: 'front' | 'back';
  bg: string | null;
  layout: CardLayout | BackCardLayout;
  data: CardData | null;
}

const convertDriveToLh3 = (link: string | undefined): string => {
  if (!link) return "https://placehold.co/250x250/EBF5FB/7f8c8d?text=Photo";
  if (link.includes("drive.google.com")) {
    const fileIdMatch = link.match(/file\/d\/([a-zA-Z0-9_-]+)/) || link.match(/id=([a-zA-Z0-9_-]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : null;
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}=s400` : link;
  }
  return link;
};

const fieldLabels: Partial<Record<LayoutKey | BackLayoutKey, string>> = {
  class: 'Class:',
  dob: 'D.O.B:',
  fatherName: "Father's Name:",
  contact: 'Contact:',
  address: 'Address:',
};

const detailFields: (keyof CardLayout)[] = ['class', 'dob', 'fatherName', 'contact', 'address'];
const positionableElementKeys = ['studentPhoto', 'name', 'detailsGroup', 'fatherPhoto', 'motherPhoto', 'qrCode', 'username'];


const IdCardRenderer = forwardRef<HTMLDivElement, IdCardRendererProps>(
  ({ cardType, bg, layout, data }, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (data?.qrCode) {
      setQrCodeUrl(data.qrCode);
    } else if (data?.link) {
      QRCode.toDataURL(data.link, { width: 300 }).then(setQrCodeUrl);
    } else {
        setQrCodeUrl('');
    }
  }, [data]);
  
  if (!data || !bg) {
    return <div ref={ref} />;
  }

  const headlineStyle: React.CSSProperties = { fontFamily: "'Poppins', sans-serif" };
  const bodyStyle: React.CSSProperties = { fontFamily: "'PT Sans', sans-serif" };

  const renderDetailsGroup = () => {
    const detailsLayout = layout as CardLayout;
    let yOffset = 0;

    return detailFields.map(key => {
      const fontLayout = detailsLayout[key as keyof CardLayout] as FontLayout & { height?: number };
      if (!fontLayout.visible) return null;

      const fieldHeight = (key === 'address' ? fontLayout.height! : 40);
      const value = data[key as keyof CardData] || `{${key}}`;

      const element = (
        <div key={key} style={{
          position: 'absolute',
          top: `${yOffset}px`,
          width: '100%',
          height: `${fieldHeight}px`,
          display: 'flex',
          alignItems: key === 'address' ? 'flex-start' : 'center',
          ...bodyStyle,
          ...(key === 'class' && { backgroundColor: '#ffde59', borderRadius: '12px' })
        }}>
          <div style={{ width: '50%', textAlign: 'right', paddingRight: '8px', fontWeight: 'bold', fontSize: `${fontLayout.labelFontSize}px` }}>
            {fieldLabels[key as keyof typeof fieldLabels]}
          </div>
          <div style={{ width: '50%', textAlign: 'left', paddingLeft: '8px', fontSize: `${fontLayout.valueFontSize}px` }}>
            {value}
          </div>
        </div>
      );

      yOffset += fieldHeight;
      return element;
    });
  };

  const filteredLayout = Object.fromEntries(
    Object.entries(layout).filter(([key]) => positionableElementKeys.includes(key))
  );

  return (
    <div
      ref={ref}
      style={{
        width: '637px',
        height: '1016px',
        fontFamily: "'PT Sans', sans-serif",
        color: '#333'
      }}
    >
        <div style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${bg})`,
            backgroundSize: '100% 100%',
            position: 'relative',
        }}>
        {Object.entries(filteredLayout).map(([key, elementLayout]: [string, any]) => {
            if(!elementLayout.visible) return null;

            const baseStyle: React.CSSProperties = {
                position: 'absolute',
                top: `${elementLayout.y}px`,
                left: `${elementLayout.x}px`,
                width: `${elementLayout.width}px`,
                height: `${elementLayout.height}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
            };

            let content;

            if (key === 'detailsGroup') {
              baseStyle.display = 'block';
              baseStyle.overflow = 'hidden';
              content = (
                <div style={{ position: 'relative', width: '100%', height: '100%'}}>
                  {renderDetailsGroup()}
                </div>
              );
            } else if (key === 'name') {
                content = <strong style={{...headlineStyle, fontSize: `${elementLayout.valueFontSize}px`, textAlign: 'center', width: '100%' }}>{data.name || '{name}'}</strong>;
            } else if (key === 'username') {
                content = <p style={{ ...bodyStyle, fontSize: `${elementLayout.valueFontSize}px`, textAlign: 'center', width: '100%' }}>{data.username || '{username}'}</p>;
            } else { 
                 switch (key as keyof (CardLayout & BackCardLayout)) {
                    case 'studentPhoto':
                        content = <img src={convertDriveToLh3(data.studentPhoto)} crossOrigin="anonymous" alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: '32px' }} />;
                        break;
                    case 'fatherPhoto':
                        content = <img src={convertDriveToLh3(data.fatherphoto)} crossOrigin="anonymous" alt="Father" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'motherPhoto':
                        content = <img src={convertDriveToLh3(data.motherphoto)} crossOrigin="anonymous" alt="Mother" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'qrCode':
                        content = qrCodeUrl ? <img src={qrCodeUrl} crossOrigin="anonymous" alt="QR Code" style={{ width: '100%', height: '100%' }} /> : null;
                        break;
                }
            }
            
            return <div key={key} style={baseStyle}>{content}</div>;
        })}
        </div>
    </div>
  );
});

IdCardRenderer.displayName = 'IdCardRenderer';

export default IdCardRenderer;
