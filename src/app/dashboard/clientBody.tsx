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
import { Colors } from "@/constants/constants";
import { axiosResponse, INotes, INotesTableArray } from "@/types/types";
import { Label } from "@radix-ui/react-context-menu";
import { Plus } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";

export function DashboardTable() {
  // const [notes, setNotes] = useState<INotes[]>([]);
  const currentPathname = usePathname();
  const navigation = useRouter();
  const [showCreateNotesModal, setShowCreateNotesModal] = useState(false);
  const queryClient = useQueryClient();
  const auth = useAuth();

  useEffect(() => console.log(auth.user?.email), [auth.user]);
  const { data } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotesFromDatabase,
    refetchInterval: 10000,
    // enabled: Boolean(auth && auth.user && auth.user?.email),
  });

  const [formData, setFormData] = useState<{ title: string }>({
    title: "",
  });

  const createNote = useMutation({
    mutationFn: createNoteInDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  function renderItems(
    data: string | string[] | INotesTableArray[] | undefined
  ) {
    if (data) {
      return (data as INotesTableArray[]).map((note) => (
        <TableRow key={note.title}>
          <TableCell className="">{note.title}</TableCell>
          <TableCell className="">{note.creationDate}</TableCell>
          <TableCell className="">{note.modifiedDate}</TableCell>
        </TableRow>
      ));
    }
  }

  async function fetchNotesFromDatabase() {
    const response: axiosResponse = await axios.get(
      "api/notes/charleetan2020@gmail.com", //`api/notes/${auth.user?.email}`
      {
        withCredentials: true,
      }
    );
    if (response.data.status === "Success") {
      return response.data.data.results;
    }
  }

  async function createNoteInDatabase(variable: INotes) {
    try {
      const response: axiosResponse = await axios.post(
        `api/notes`,
        { title: variable.title },
        {
          withCredentials: true,
        }
      );
      if (response.data.status === "Success") {
        const { noteId } = response.data.data;
        navigation.push(`${currentPathname}?=${noteId}`);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => console.log(data), [data]);
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
            <TableHead className="w-[33.3%]">Notes</TableHead>
            <TableHead className="w-[33.3%]">Creation Date</TableHead>
            <TableHead className="w-[33.3%]">Modified Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderItems(data)}</TableBody>
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
                  onChange={handleInput}
                  autoComplete="off"
                  name="title"
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
                onClick={() => {
                  createNote.mutate({ title: formData.title });
                }}
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
