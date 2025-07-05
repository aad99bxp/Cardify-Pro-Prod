"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Wand2 } from 'lucide-react';
import type { CardData } from '@/lib/card-types';

interface ControlPanelProps {
  onFrontBgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackBgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCsvChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  csvData: CardData[];
}

export function ControlPanel({
  onFrontBgChange,
  onBackBgChange,
  onCsvChange,
  onGenerate,
  isProcessing,
  csvData,
}: ControlPanelProps) {
  return (
    <aside className="w-80 bg-card border-r border-border p-6 flex flex-col gap-8 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <Upload className="text-primary" />
            Upload Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="front-bg">Front Background</Label>
            <Input id="front-bg" type="file" accept="image/*" onChange={onFrontBgChange} className="file:text-primary file:font-semibold"/>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="back-bg">Back Background</Label>
            <Input id="back-bg" type="file" accept="image/*" onChange={onBackBgChange} className="file:text-primary file:font-semibold"/>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-file">
              <FileText className="inline-block mr-2 h-4 w-4" />
              Student Data (CSV)
            </Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={onCsvChange} className="file:text-primary file:font-semibold"/>
            {csvData.length > 0 && <p className="text-sm text-muted-foreground mt-2">{csvData.length} records loaded.</p>}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-auto">
        <Button
          onClick={onGenerate}
          disabled={isProcessing || csvData.length === 0}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold py-6 text-lg"
          size="lg"
        >
          <Wand2 className="mr-2 h-5 w-5" />
          {isProcessing ? 'Processing...' : `Generate ${csvData.length > 0 ? csvData.length : ''} Cards`}
        </Button>
      </div>
    </aside>
  );
}
