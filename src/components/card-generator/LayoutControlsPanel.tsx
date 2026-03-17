"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { CardLayout, BackCardLayout, ElementLayout, LayoutKey, BackLayoutKey } from '@/lib/card-types';
import { Type, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown, Palette, AlignHorizontalJustifyCenter, Square, Indent } from 'lucide-react';
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
  const frontLayout = layout as CardLayout;

  const handleSliderChange = (key: LayoutKey | BackLayoutKey, property: 'labelFontSize' | 'valueFontSize' | 'borderWidth', value: number[]) => {
    onLayoutChange(key, { [property]: value[0] });
  };
  
  const handleAlignmentChange = (key: 'name' | 'detailsGroup', value: 'left' | 'center' | 'right' | 'justify') => {
    if(value) onLayoutChange(key, { textAlign: value });
  };

  const handleLineHeightChange = (value: number[]) => {
    onLayoutChange('detailsGroup', { lineHeight: value[0] });
  };
  
  return (
    <Card className="w-full md:w-80">
      <CardHeader>
        <CardTitle className="text-xl">Layout Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={['font-sizes', 'field-settings']}>
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
             {cardType === 'front' && (
              <AccordionItem value="highlights">
                <AccordionTrigger><Palette className="mr-2 h-4 w-4" /> Highlights</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name-highlight-color">Name Highlight Color</Label>
                    <Input id="name-highlight-color" type="color" value={frontLayout.name.highlightColor} onChange={(e) => onLayoutChange('name', { highlightColor: e.target.value })} className="h-8"/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class-highlight-color">Class Highlight Color</Label>
                    <Input id="class-highlight-color" type="color" value={frontLayout.class.highlightColor} onChange={(e) => onLayoutChange('class', { highlightColor: e.target.value })} className="h-8"/>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {cardType === 'front' && (
              <AccordionItem value="alignment">
                <AccordionTrigger><AlignHorizontalJustifyCenter className="mr-2 h-4 w-4" /> Text Alignment</AccordionTrigger>
                <AccordionContent className="space-y-4">
                   <div className="grid gap-2">
                    <Label>Name Alignment</Label>
                    <RadioGroup value={frontLayout.name.textAlign} onValueChange={(val) => handleAlignmentChange('name', val as any)} className="flex gap-2 pt-2">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="left" id="name-align-left" /><Label htmlFor="name-align-left">Left</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="center" id="name-align-center" /><Label htmlFor="name-align-center">Center</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="right" id="name-align-right" /><Label htmlFor="name-align-right">Right</Label></div>
                    </RadioGroup>
                  </div>
                   <div className="grid gap-2">
                    <Label>Details Alignment</Label>
                    <RadioGroup value={frontLayout.detailsGroup.textAlign} onValueChange={(val) => handleAlignmentChange('detailsGroup', val as any)} className="flex gap-2 pt-2">
                      <div className="flex items-center space-x-1"><RadioGroupItem value="left" id="details-align-left" /><Label htmlFor="details-align-left">Left</Label></div>
                       <div className="flex items-center space-x-1"><RadioGroupItem value="center" id="details-align-center" /><Label htmlFor="details-align-center">Center</Label></div>
                      <div className="flex items-center space-x-1"><RadioGroupItem value="right" id="details-align-right" /><Label htmlFor="details-align-right">Right</Label></div>
                    </RadioGroup>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

             {cardType === 'front' && (
              <AccordionItem value="borders">
                <AccordionTrigger><Square className="mr-2 h-4 w-4" /> Photo Border</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="photo-border-color">Border Color</Label>
                    <Input id="photo-border-color" type="color" value={frontLayout.studentPhoto.borderColor} onChange={(e) => onLayoutChange('studentPhoto', { borderColor: e.target.value })} className="h-8"/>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="photo-border-width">Border Width: {frontLayout.studentPhoto.borderWidth}px</Label>
                    <Slider id="photo-border-width" min={0} max={20} step={1} value={[frontLayout.studentPhoto.borderWidth]} onValueChange={(val) => handleSliderChange('studentPhoto', 'borderWidth', val)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {cardType === 'front' && (
              <AccordionItem value="spacing">
                <AccordionTrigger><Indent className="mr-2 h-4 w-4" /> Spacing</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    <Label htmlFor="details-line-height">Details Line Height: {frontLayout.detailsGroup.lineHeight.toFixed(1)}</Label>
                    <Slider id="details-line-height" min={1} max={3} step={0.1} value={[frontLayout.detailsGroup.lineHeight]} onValueChange={handleLineHeightChange} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

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
