import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import AppButton from "./AppButton";

interface InvoiceSummary {
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
}

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number; // Changed from amount to unitPrice
}

interface InvoiceSummaryProps {
  items: InvoiceItem[];
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ items }) => {
  const [summary, setSummary] = useState<InvoiceSummary>({
    subtotal: 0,
    totalDiscount: 0,
    totalGst: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    // Calculate subtotal as sum of (quantity * unitPrice) for all items
    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    const totalDiscount = 0; // update if you have discounts logic
    const totalGst = 0; // update if you have GST calculation logic

    const grandTotal = subtotal - totalDiscount + totalGst;

    setSummary({
      subtotal,
      totalDiscount,
      totalGst,
      grandTotal,
    });
  }, [items]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <div className="flex justify-end mr-10">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-primary-foreground bg-[#01576A] p-4 -m-6 mb-4 rounded-t-lg text-left">
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">
              {formatCurrency(summary.totalDiscount)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">GST</span>
            <span className="font-medium">
              {formatCurrency(summary.totalGst)}
            </span>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Grand Total</span>
              <span className="text-xl font-bold text-success text-[#01576A]">
                {formatCurrency(summary.grandTotal)}
              </span>
            </div>
          </div>
          <AppButton
            label="Invoice"
            className="w-full !border-none !text-white"
          />
        </CardContent>
      </Card>
    </div>
  );
};
