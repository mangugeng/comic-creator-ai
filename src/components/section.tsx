"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

export interface SectionProps {
  title: string;
  description: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export function Section({ title, description, children, isExpanded, onToggle }: SectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" onClick={onToggle}>
            {isExpanded ? "Tutup" : "Buka"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
} 