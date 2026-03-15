"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { CardLayout, BackCardLayout, ElementLayout, LayoutKey, BackLayoutKey } from '@/lib/card-types';
import { Type, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface LayoutControlsPanelProps {
  cardType: 'front' | 'back';
  layout: CardLayout | BackCardLayout;
  onLayoutChange: (key: LayoutKey | BackLayoutKey, newLayout: Partial<ElementLayout>) => void;
  detailFieldsOrder?: (keyof CardLayout)[];
  onFieldVisibilityChange?: (key: LayoutKey, visible: boolean) => void;
  onMoveField?: (index: number, direction: 'up' | 'down') => void;
}

const humanReadableNames: Record<string, string> = {
  studentPhoto: 'Student Photo',
  name: 'Student Name',
  class: 'Class',
  rollNo: 'Roll No.',
  section: 'Section',
  dob: 'Date of Birth',
  fatherName: "Father's Name",
  motherName: "Mother's Name",
  admissionNo: 'Admission No.',
  contact: 'Contact No.',
  address: 'Address',
  fatherPhoto: "Father's Photo",
  motherPhoto: "Mother's Photo",
  qrCode: 'QR Code',
  username: 'Username',
};


export function LayoutControlsPanel({ cardType, layout, onLayoutChange, detailFieldsOrder, onFieldVisibilityChange, onMoveField }: LayoutControlsPanelProps) {
  const textElements = Object.entries(layout).filter(([_, v]) => v.valueFontSize);

  const handleSliderChange = (key: LayoutKey | BackLayoutKey, property: 'labelFontSize' | 'valueFontSize', value: number[]) => {
    onLayoutChange(key, { [property]: value[0] });
  };
  
  return (
    <Card className="w-full md:w-80">
      <CardHeader>
        <CardTitle className="text-xl">Layout Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={['field-settings', 'font-sizes']}>
            {cardType === 'front' && detailFieldsOrder && onFieldVisibilityChange && onMoveField && (
                <AccordionItem value="field-settings">
                    <AccordionTrigger><GripVertical className="mr-2 h-4 w-4" /> Field Settings</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground pb-2">Toggle visibility and reorder fields.</p>
                            {detailFieldsOrder.map((key, index) => (
                                <div key={key} className="flex items-center justify-between p-2 border-b">
                                    <Label htmlFor={`visible-${key}`} className="font-semibold text-sm">{humanReadableNames[key] || key}</Label>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id={`visible-${key}`}
                                            checked={(layout as CardLayout)[key]?.visible}
                                            onCheckedChange={(checked) => onFieldVisibilityChange(key as LayoutKey, checked)}
                                        />
                                        <div className="flex flex-col">
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onMoveField(index, 'up')} disabled={index === 0}>
                                                <ChevronUp className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onMoveField(index, 'down')} disabled={index === detailFieldsOrder.length - 1}>
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            )}
            <AccordionItem value="font-sizes">
                <AccordionTrigger><Type className="mr-2 h-4 w-4" /> Font Sizes</AccordionTrigger>
                <AccordionContent>
                    {textElements.map(([key, elementLayout]) => (
                        <div key={key} className="mb-4 p-2 border-b">
                            <h4 className="font-semibold mb-3">{humanReadableNames[key] || key}</h4>
                             {elementLayout.labelFontSize && (
                                <div className="grid gap-2 mb-3">
                                    <Label htmlFor={`${key}-label-size`}>Label Size: {elementLayout.labelFontSize}px</Label>
                                    <Slider
                                        id={`${key}-label-size`}
                                        min={10} max={50} step={1}
                                        value={[elementLayout.labelFontSize]}
                                        onValueChange={(val) => handleSliderChange(key as any, 'labelFontSize', val)}
                                    />
                                </div>
                            )}
                            {elementLayout.valueFontSize && (
                                <div className="grid gap-2">
                                    <Label htmlFor={`${key}-value-size`}>Value Size: {elementLayout.valueFontSize}px</Label>
                                    <Slider
                                        id={`${key}-value-size`}
                                        min={10} max={50} step={1}
                                        value={[elementLayout.valueFontSize]}
                                        onValueChange={(val) => handleSliderChange(key as any, 'valueFontSize', val)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="image-elements">
                <AccordionTrigger><ImageIcon className="mr-2 h-4 w-4" /> Other Elements</AccordionTrigger>
                <AccordionContent>
                    <p className="text-sm text-muted-foreground">Image elements can be resized and moved by dragging them directly on the card preview.</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
