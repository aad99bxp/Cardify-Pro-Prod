
"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import type { CardData, CardLayout, BackCardLayout, LayoutKey, BackLayoutKey } from '@/lib/card-types';
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

  const headlineStyle = { fontFamily: "'Poppins', sans-serif" };
  const bodyStyle = { fontFamily: "'PT Sans', sans-serif" };

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
        {Object.entries(layout).map(([key, elementLayout]) => {
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
            if (elementLayout.valueFontSize) {
                const label = fieldLabels[key as keyof typeof fieldLabels];
                 if (key === 'name') {
                    content = <strong style={{...headlineStyle, fontSize: `${elementLayout.valueFontSize}px`, textAlign: 'center', width: '100%' }}>{data.name || '{name}'}</strong>;
                } else if (key === 'username') {
                    content = <p style={{ ...bodyStyle, fontSize: `${elementLayout.valueFontSize}px`, textAlign: 'center', width: '100%' }}>{data.username || '{username}'}</p>;
                } else if (label) {
                    const value = data[key as keyof CardData] || `{${key}}`;
                    baseStyle.alignItems = 'flex-start';
                    content = (
                        <div style={{ display: 'flex', width: '100%', ...bodyStyle }}>
                            <div style={{ width: '45%', textAlign: 'right', paddingRight: '8px', fontWeight: 'bold', fontSize: `${elementLayout.labelFontSize}px` }}>
                                {label}
                            </div>
                            <div style={{ width: '55%', textAlign: 'left', fontSize: `${elementLayout.valueFontSize}px` }}>
                                {value}
                            </div>
                        </div>
                    );
                }
            } else { // Image and QR elements
                 switch (key as keyof (CardLayout & BackCardLayout)) {
                    case 'studentPhoto':
                        content = <img src={convertDriveToLh3(data.studentPhoto)} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'fatherPhoto':
                        content = <img src={convertDriveToLh3(data.fatherphoto)} alt="Father" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'motherPhoto':
                        content = <img src={convertDriveToLh3(data.motherphoto)} alt="Mother" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'qrCode':
                        content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} /> : null;
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
