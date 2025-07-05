
"use client";

import React, { forwardRef, useEffect, useState } from 'react';
import type { CardData, CardLayout, BackCardLayout } from '@/lib/card-types';
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
                textAlign: 'center',
                overflowWrap: 'break-word',
                color: 'black',
            };

            let content;
            if (cardType === 'front') {
                const frontLayout = layout as CardLayout;
                switch (key as keyof CardLayout) {
                    case 'studentPhoto':
                        content = <img src={convertDriveToLh3(data.studentPhoto)} alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'name':
                        content = <strong style={{...headlineStyle, fontSize: `${elementLayout.fontSize}px` }}>{data.name || '{name}'}</strong>;
                        break;
                    case 'class':
                         baseStyle.justifyContent = 'flex-start';
                         content = <p style={{...bodyStyle, fontSize: `${elementLayout.fontSize}px`, backgroundColor: '#f5d85e', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}><strong>Class:</strong> {data.class || '{class}'}</p>
                         break;
                    case 'dob':
                        baseStyle.justifyContent = 'flex-start';
                        content = (
                            <div style={{ display: 'flex', width: '100%', fontSize: `${elementLayout.fontSize}px`, ...bodyStyle }}>
                                <strong style={{ width: '45%', textAlign: 'right', paddingRight: '8px' }}>D.O.B:</strong>
                                <span style={{ width: '55%', textAlign: 'left' }}>{data.dob || '{dob}'}</span>
                            </div>
                        );
                        break;
                    case 'fatherName':
                        baseStyle.justifyContent = 'flex-start';
                        content = (
                            <div style={{ display: 'flex', width: '100%', fontSize: `${elementLayout.fontSize}px`, ...bodyStyle }}>
                                <strong style={{ width: '45%', textAlign: 'right', paddingRight: '8px' }}>Father's Name:</strong>
                                <span style={{ width: '55%', textAlign: 'left' }}>{data.fatherName || '{fatherName}'}</span>
                            </div>
                        );
                        break;
                    case 'contact':
                        baseStyle.justifyContent = 'flex-start';
                        content = (
                            <div style={{ display: 'flex', width: '100%', fontSize: `${elementLayout.fontSize}px`, ...bodyStyle }}>
                                <strong style={{ width: '45%', textAlign: 'right', paddingRight: '8px' }}>Contact:</strong>
                                <span style={{ width: '55%', textAlign: 'left' }}>{data.contact || '{contact}'}</span>
                            </div>
                        );
                        break;
                    case 'address':
                        baseStyle.justifyContent = 'flex-start';
                        baseStyle.alignItems = 'flex-start';
                        content = (
                            <div style={{ display: 'flex', width: '100%', fontSize: `${elementLayout.fontSize}px`, ...bodyStyle }}>
                                <strong style={{ width: '45%', textAlign: 'right', paddingRight: '8px', flexShrink: 0 }}>Address:</strong>
                                <span style={{ width: '55%', textAlign: 'left' }}>{data.address || '{address}'}</span>
                            </div>
                        );
                        break;
                    default:
                        content = <span style={{...bodyStyle, fontSize: `${elementLayout.fontSize}px`, textAlign:'left', width: '100%' }}>{data[key as keyof CardData]}</span>
                        break;
                }
            } else {
                const backLayout = layout as BackCardLayout;
                switch (key as keyof BackCardLayout) {
                    case 'fatherPhoto':
                        content = <img src={convertDriveToLh3(data.fatherphoto)} alt="Father" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'motherPhoto':
                        content = <img src={convertDriveToLh3(data.motherphoto)} alt="Mother" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '32px' }} />;
                        break;
                    case 'qrCode':
                        content = qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%' }} /> : null;
                        break;
                    case 'username':
                        content = <p style={{ ...bodyStyle, fontSize: `${elementLayout.fontSize}px` }}>{data.username || '{username}'}</p>;
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
