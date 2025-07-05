"use client";

import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import type { Layout, CardData, ElementLayout, LayoutKey, BackLayoutKey } from '@/lib/card-types';
import { ControlPanel } from './ControlPanel';
import { EditorPanel } from './EditorPanel';
import IdCardRenderer from './IdCardRenderer';
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

const initialLayout: Layout = {
  front: {
    studentPhoto: { x: 194, y: 228, width: 250, height: 250, visible: true },
    name: { x: 20, y: 500, width: 597, height: 60, fontSize: 40, visible: true },
    class: { x: 228, y: 565, width: 180, height: 45, fontSize: 30, visible: true },
    dob: { x: 318, y: 642, width: 200, height: 38, fontSize: 24, visible: true },
    fatherName: { x: 318, y: 686, width: 300, height: 38, fontSize: 24, visible: true },
    contact: { x: 318, y: 730, width: 300, height: 38, fontSize: 24, visible: true },
    address: { x: 318, y: 774, width: 300, height: 80, fontSize: 24, visible: true },
  },
  back: {
    fatherPhoto: { x: 34, y: 250, width: 250, height: 250, visible: true },
    motherPhoto: { x: 353, y: 250, width: 250, height: 250, visible: true },
    qrCode: { x: 168, y: 570, width: 300, height: 300, visible: true },
    username: { x: 168, y: 880, width: 300, height: 38, fontSize: 24, visible: true },
  },
};

export function CardGenerator() {
  const [frontBg, setFrontBg] = useState<string | null>("https://lh3.googleusercontent.com/d/11rxe63TxPfS5Feu0aKSRxoc1DuaNKj4U=s1600");
  const [backBg, setBackBg] = useState<string | null>("https://lh3.googleusercontent.com/d/1QJ2pNjvRLJFZnBxfVm_B2O_fxe63ZJ1E=s1600");
  const [csvData, setCsvData] = useState<CardData[]>([]);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [firstRowData, setFirstRowData] = useState<CardData | null>(null);

  const { toast } = useToast()

  const frontRendererRef = useRef<HTMLDivElement>(null);
  const backRendererRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<string | null>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Papa.parse<CardData>(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0) {
            toast({ variant: "destructive", title: "CSV Parsing Error", description: results.errors.map(e => e.message).join('\n') });
            return;
          }
          const data = results.data;
          setCsvData(data);
          if (data.length > 0) {
            const firstRow = data[0];
            try {
              const qrCode = await QRCode.toDataURL(firstRow.link || 'N/A');
              setFirstRowData({ ...firstRow, qrCode });
            } catch (error) {
              console.error("Failed to generate QR code for preview", error);
              setFirstRowData(firstRow);
            }
          } else {
            setFirstRowData(null);
          }
          toast({ title: "CSV Loaded", description: `${data.length} records found.`});
        },
      });
    }
  };

  const updateLayout = useCallback((cardType: 'front' | 'back', key: LayoutKey | BackLayoutKey, newLayout: Partial<ElementLayout>) => {
    setLayout(prev => ({
      ...prev,
      [cardType]: {
        ...prev[cardType],
        [key]: {
          ...prev[cardType][key as keyof typeof prev[cardType]],
          ...newLayout,
        },
      },
    }));
  }, []);

  const handleGenerate = async () => {
    if (csvData.length === 0) {
      toast({ variant: "destructive", title: "No CSV data", description: "Please upload a CSV file to generate cards." });
      return;
    }
    if (!frontBg || !backBg) {
      toast({ variant: "destructive", title: "Missing background", description: "Please upload both front and back background images." });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);

    const frontZip = new JSZip();
    const backZip = new JSZip();

    const fontUrl = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&family=Cardo:wght@700&display=swap";
    const fontCSS = await fetch(fontUrl).then(res => res.text()).catch(err => {
        console.error("Failed to fetch font CSS, generated images may lack correct fonts.", err);
        return '';
    });

    const imageOptions = {
      width: 637,
      height: 1016,
      pixelRatio: 1,
      fontEmbedCSS: fontCSS,
      fetchRequestInit: { mode: 'cors' as RequestMode, cache: 'no-cache' as RequestCache }
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const qrCodeUrl = await QRCode.toDataURL(row.link || 'N/A');

      await new Promise<void>((resolve) => {
        setFirstRowData({ ...row, qrCode: qrCodeUrl });
        setTimeout(resolve, 100);
      });

      const [frontDataUrl, backDataUrl] = await Promise.all([
        toPng(frontRendererRef.current!, imageOptions),
        toPng(backRendererRef.current!, imageOptions),
      ]);

      frontZip.file(`${i + 1}_${row.name}_front.png`, frontDataUrl.split(',')[1], { base64: true });
      backZip.file(`${i + 1}_${row.name}_back.png`, backDataUrl.split(',')[1], { base64: true });

      setProgress(((i + 1) / csvData.length) * 100);
    }
    
    toast({ title: "Generation Complete!", description: "Zipping files for download..." });

    const frontBlob = await frontZip.generateAsync({ type: 'blob' });
    saveAs(frontBlob, 'front_cards.zip');

    const backBlob = await backZip.generateAsync({ type: 'blob' });
    saveAs(backBlob, 'back_cards.zip');
    
    setIsProcessing(false);

    if (csvData.length > 0) {
        const firstRow = csvData[0];
        const qrCode = await QRCode.toDataURL(firstRow.link || 'N/A');
        setFirstRowData({ ...firstRow, qrCode });
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-body">
      <ControlPanel
        onFrontBgChange={handleFileChange(setFrontBg)}
        onBackBgChange={handleFileChange(setBackBg)}
        onCsvChange={handleCsvUpload}
        onGenerate={handleGenerate}
        isProcessing={isProcessing}
        csvData={csvData}
      />
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-auto">
        <h1 className="font-headline text-3xl font-bold text-gray-800 dark:text-gray-200">Cardify Pro</h1>
        <p className="text-muted-foreground mb-6">Create and customize ID cards with ease.</p>
        <EditorPanel
          frontBg={frontBg}
          backBg={backBg}
          layout={layout}
          onLayoutChange={updateLayout}
          data={firstRowData}
        />
        {isProcessing && (
            <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
                <div className="bg-card p-8 rounded-lg shadow-2xl text-center">
                    <h2 className="font-headline text-2xl mb-4">Generating Cards...</h2>
                    <p className="text-muted-foreground mb-4">Please wait while we process your request.</p>
                    <Progress value={progress} className="w-[300px]" />
                    <p className="mt-2 text-sm font-semibold">{Math.round(progress)}%</p>
                </div>
            </div>
        )}
      </main>
      <IdCardRenderer ref={frontRendererRef} cardType="front" bg={frontBg} layout={layout.front} data={firstRowData} />
      <IdCardRenderer ref={backRendererRef} cardType="back" bg={backBg} layout={layout.back} data={firstRowData} />
    </div>
  );
}
