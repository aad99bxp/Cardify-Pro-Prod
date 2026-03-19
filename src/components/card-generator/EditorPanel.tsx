
"use client";

import { CardPreview } from './CardPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Layout, CardData, ElementLayout, LayoutKey, BackLayoutKey, CardLayout } from '@/lib/card-types';
import { LayoutControlsPanel } from './LayoutControlsPanel';

interface EditorPanelProps {
  frontBg: string | null;
  backBg: string | null;
  layout: Layout;
  onLayoutChange: (cardType: 'front' | 'back', key: LayoutKey | BackLayoutKey, newLayout: Partial<ElementLayout>) => void;
  data: CardData | null;
  detailFieldsOrder: (keyof CardLayout)[];
  onFieldVisibilityChange: (key: LayoutKey, visible: boolean) => void;
  onMoveField: (index: number, direction: 'up' | 'down') => void;
}

export function EditorPanel({ frontBg, backBg, layout, onLayoutChange, data, detailFieldsOrder, onFieldVisibilityChange, onMoveField }: EditorPanelProps) {
  return (
    <div className="flex-1 bg-card/50 p-4 rounded-lg border border-border">
       <Tabs defaultValue="front" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="front">Front View</TabsTrigger>
          <TabsTrigger value="back">Back View</TabsTrigger>
        </TabsList>
        <TabsContent value="front">
          <div className="mt-4 flex flex-col md:flex-row gap-8 justify-center items-start">
             <CardPreview
              id="front-preview"
              bg={frontBg}
              layout={layout.front}
              onLayoutChange={(key, newLayout) => onLayoutChange('front', key as LayoutKey, newLayout)}
              data={data}
              cardType="front"
            />
            <LayoutControlsPanel 
              cardType="front"
              layout={layout.front}
              onLayoutChange={(key, newLayout) => onLayoutChange('front', key as LayoutKey, newLayout)}
              detailFieldsOrder={detailFieldsOrder}
              onFieldVisibilityChange={onFieldVisibilityChange}
              onMoveField={onMoveField}
            />
          </div>
        </TabsContent>
        <TabsContent value="back">
           <div className="mt-4 flex flex-col md:flex-row gap-8 justify-center items-start">
            <CardPreview
              id="back-preview"
              bg={backBg}
              layout={layout.back}
              onLayoutChange={(key, newLayout) => onLayoutChange('back', key as BackLayoutKey, newLayout)}
              data={data}
              cardType="back"
            />
             <LayoutControlsPanel 
              cardType="back"
              layout={layout.back}
              onLayoutChange={(key, newLayout) => onLayoutChange('back', key as BackLayoutKey, newLayout)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
