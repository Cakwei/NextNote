"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INotes } from "@/types/types";
import { Plus } from "lucide-react";
import { useState } from "react";

export function DashboardTable() {
  const [notes, setNotes] = useState<INotes[]>([]);

  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ];

  function renderItems() {
    if (invoices) {
      return invoices.map((invoice) => (
        <TableRow key={invoice.invoice}>
          <TableCell className="font-medium">{invoice.invoice}</TableCell>
          <TableCell className="text-right">{invoice.totalAmount}</TableCell>
        </TableRow>
      ));
    }
  }
  return (
    <>
      <h1 className="font-bold">Created Notes</h1>
      <div className="flex w-full justify-end">
        <Button className="bg-[#e9e9e9] text-black hover:bg-[#e9e9e9]/35">
          <Plus />
          New
        </Button>
      </div>
      <Table>
        <TableCaption>{"A list of your recent invoices."}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Notes</TableHead>
            <TableHead className="text-right">Modified Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderItems()}</TableBody>
      </Table>
    </>
  );
}
