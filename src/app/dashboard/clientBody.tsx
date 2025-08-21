"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Colors, invoices } from "@/constants/constants";
import { axiosResponse } from "@/types/types";
import { Label } from "@radix-ui/react-context-menu";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function DashboardTable() {
  // const [notes, setNotes] = useState<INotes[]>([]);
  const [showCreateNotesModal, setShowCreateNotesModal] = useState(false);
  const query = useQuery({
    queryKey: ["notes"],
    queryFn: createNoteInDatabase,
  });

  function renderItems() {
    if (invoices) {
      return (query.data || invoices).map((invoice) => (
        <TableRow key={invoice.invoice}>
          <TableCell className="font-medium">{invoice.invoice}</TableCell>
          <TableCell className="text-right">{invoice.totalAmount}</TableCell>
        </TableRow>
      ));
    }
  }
  async function fetchNotesFromDatabase() {
    const response: axiosResponse = await axios.get(`api/notes/123`, {
      withCredentials: true,
    });

    if (response.data.code === 200) {
    }
  }

  async function createNoteInDatabase() {
    const response: axiosResponse = await axios.post(`api/notes`, {
      withCredentials: true,
    });
    console.log(response)
    if (response.data.code === 201) {
    }
  }

  return (
    <>
      <h1 className="font-bold">Created Notes</h1>
      <div className="flex w-full justify-end">
        <Button
          onClick={() => {
            setShowCreateNotesModal(true);
          }}
          style={{ backgroundColor: Colors.applePrimary }}
          className=""
        >
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

      {/* Dialogs */}
      <Dialog
        open={showCreateNotesModal}
        onOpenChange={setShowCreateNotesModal}
      >
        <form>
          <DialogContent className="max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Create a new note</DialogTitle>
              <DialogDescription>
                Choose a name of your choice to uniquely identify your notes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-1">
                <Label>Name</Label>
                <Input
                  autoComplete="off"
                  name="name"
                  placeholder="My Notes 1"
                  className="placeholder:text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={createNoteInDatabase}
                style={{ backgroundColor: Colors.applePrimary }}
                type="submit"
                className=""
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </>
  );
}
