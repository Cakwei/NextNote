"use client";
import React, { useState, FC, useEffect, useRef, ChangeEvent } from "react";
import {
  useEditor,
  EditorContent,
  Editor as TipTapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { DOMSerializer } from "prosemirror-model";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontSize from "@tiptap/extension-font-size";
import ResizableImage from "tiptap-extension-resize-image";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { findParentNodeOfType } from "prosemirror-utils";
import {
  Bold,
  Italic,
  Underline as LucideUnderline,
  Strikethrough,
  Code,
  Quote,
  Minus,
  Image as LucideImage,
  ListTodo,
  AlignLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "./style/editor.css";
import { fontFamilies, fontSizes } from "@/constants/constants";
import { Separator } from "@/components/ui/separator";
import { Extension } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";
import {
  AlignCenter,
  AlignJustify,
  AlignRight,
  Columns,
  Download,
  List,
  ListOrdered,
  LucideLink,
  LucideTable,
  Palette,
  Redo,
  Rows,
  Save,
  Undo,
} from "lucide-react";

interface ToolbarProps {
  editor: TipTapEditor | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customTableCell: {
      /**
       * Selects the content of the current cell.
       */
      selectCellContent: () => ReturnType;
    };
    images: {
      setAttributes: (attributes: { width?: string | null }) => ReturnType;
    };
  }
}
const Toolbar: FC<ToolbarProps> = ({ editor }) => {
  // eslint-disable-next-line
  const [fontSearch, setFontSearch] = useState("");
  const filteredFonts = fontFamilies.filter((font) =>
    font.label.toLowerCase().includes(fontSearch.toLowerCase())
  );
  const [buttonStates, setButtonStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    blockquote: false,
    codeBlock: false,
  });
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isTextColorModalOpen, setIsTextColorModalOpen] = useState(false);
  // eslint-disable-next-line
  const [isCellColorModalOpen, setIsCellColorModalOpen] = useState(false);
  // eslint-disable-next-line
  const [isCustomTextColorModalOpen, setIsCustomTextColorModalOpen] =
    useState(false);
  const [activeColor, setActiveColor] = useState("#000000");
  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#C0C0C0",
    "#808080",
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const handleUpdate = () => {
      setButtonStates({
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        blockquote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
      });

      const currentTextColor =
        editor.getAttributes("textStyle").color || "#000000";
      setActiveColor(currentTextColor);
    };
    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);
  if (!editor) {
    return null;
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          editor
            .chain()
            .focus()
            .setImage({ src: e.target.result as string })
            .run();
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const openLinkModal = () => {
    const currentLink = editor.getAttributes("link").href;
    setLinkUrl(currentLink || "");
    setIsLinkModalOpen(true);
  };
  const applyLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const handleTextColorChange = (color: string) => {
    setActiveColor(color);
    editor.chain().focus().setColor(color).run();
  };
  const handleCellColorChange = (color: string) => {
    if (editor.isActive("table")) {
      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
    }
  };

  const exportJSONFormat = () => {
    const blob = new Blob([JSON.stringify(editor?.getJSON())], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Downloaded Note";
    a.click();
    URL.revokeObjectURL(url);
  };
  const isTableActive = editor.isActive("table");

  return (
    <div className="flex items-center space-x-2 p-4 bg-[#f9f9f9] border-b border-zinc-400 flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md ${
          buttonStates.bold ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md ${
          buttonStates.italic ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-md
${buttonStates.underline ? "bg-gray-200" : "hover:bg-gray-100"}`}
        title="Underline"
      >
        <LucideUnderline size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded-md ${
          buttonStates.strike ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-md ${
          buttonStates.blockquote ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded-md ${
          buttonStates.codeBlock ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Horizontal Rule"
      >
        <Minus size={16} />
      </button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Add Image"
      >
        <LucideImage size={16} />
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
        className="p-2 rounded-md hover:bg-gray-100"
        title="Add Table"
      >
        <LucideTable size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-2 rounded-md ${
          editor.isActive("taskList") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Toggle Task List"
      >
        <ListTodo size={16} />
      </button>

      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogTrigger asChild>
          <button
            onClick={openLinkModal}
            className={`p-2 rounded-md ${
              editor.isActive("link") ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
            title="Add Link"
          >
            <LucideLink size={16} />
          </button>
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>
              {editor.isActive("link") ? "Edit Link" : "Add Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="link-url"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setIsLinkModalOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={applyLink}>
                {linkUrl ? "Apply" : "Remove Link"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md ${
          editor.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md ${
          editor.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      {isTableActive && (
        <>
          <span className="h-6 w-px bg-gray-300 mx-1"></span>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Add Row Above"
          >
            <Rows size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Add Row Below"
          >
            <Rows size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Add Column Left"
          >
            <Columns size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Add Column Right"
          >
            <Columns size={16} className="rotate-180" />
          </button>
        </>
      )}

      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 rounded-md ${
          editor.isActive({ textAlign: "left" })
            ? "bg-gray-200"
            : "hover:bg-gray-100"
        }`}
        title="Align Left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 rounded-md ${
          editor.isActive({ textAlign: "center" })
            ? "bg-gray-200"
            : "hover:bg-gray-100"
        }`}
        title="Align Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-2 rounded-md ${
          editor.isActive({ textAlign: "right" })
            ? "bg-gray-200"
            : "hover:bg-gray-100"
        }`}
        title="Align Right"
      >
        <AlignRight size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={`p-2 rounded-md ${
          editor.isActive({ textAlign: "justify" })
            ? "bg-gray-200"
            : "hover:bg-gray-100"
        }`}
        title="Justify"
      >
        <AlignJustify size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Redo"
      >
        <Redo size={16} />
      </button>

      <Dialog
        open={isTextColorModalOpen}
        onOpenChange={setIsTextColorModalOpen}
      >
        <DialogTrigger asChild>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            title="Text Color"
          >
            <div
              className="w-4 h-4 rounded-full border border-gray-400"
              style={{ backgroundColor: activeColor }}
            />
          </button>
        </DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Select Text Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <h3 className="text-md font-medium text-gray-600 mb-2">
              Text Color
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    handleTextColorChange(color);
                    setIsTextColorModalOpen(false);
                  }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    activeColor === color
                      ? "border-3 border-blue-500"
                      : "border-transparent hover:border-zinc-400"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                onClick={() => {
                  setIsTextColorModalOpen(false);
                  setIsCustomTextColorModalOpen(true);
                }}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-zinc-400 flex items-center justify-center"
                title="Custom Color"
              >
                <Palette size={16} />
              </button>
            </div>
            <Separator style={{ margin: "10px 0" }} />
            <h3 className="text-md font-medium text-gray-600 mb-2">
              Cell Color
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    handleCellColorChange(color);
                    setIsTextColorModalOpen(false);
                  }}
                  disabled={!isTableActive}
                  className={`w-8 h-8 rounded-full border-2 border-zinc-300 ${
                    isTableActive
                      ? "border-3 hover:border-zinc-400"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                onClick={() => {
                  setIsTextColorModalOpen(false);
                  setIsCellColorModalOpen(true);
                }}
                className={`w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center ${
                  isTableActive
                    ? "hover:border-zinc-400"
                    : "opacity-50 cursor-not-allowed"
                }`}
                title="Custom Cell Color"
                disabled={!isTableActive}
              >
                <Palette size={16} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button
        onClick={exportJSONFormat}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Save"
      >
        <Save size={16} color={"black"} />
      </button>
      <button
        onClick={() => {
          const json = prompt("Paste your JSON here to load a note:");
          if (json) {
            try {
              editor.commands.setContent(JSON.parse(json));
            } catch {
              alert("Invalid JSON format.");
            }
          }
        }}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Load Note"
      >
        <Download size={16} color={"black"} />
      </button>

      <div className="relative flex gap-2 max-[850px]:justify-start max-[850px]:w-full">
        <Select
          value={editor.getAttributes("textStyle").fontFamily || ""}
          onValueChange={(value) => {
            const chain = editor.chain().focus();
            if (value) {
              chain.setFontFamily(value);
            } else {
              chain.unsetFontFamily();
            }
            chain.run();
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Font" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            {filteredFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={editor.getAttributes("textStyle").fontSize || ""}
          onValueChange={(value) => {
            const chain = editor.chain().focus();
            if (value) {
              chain.setFontSize(value);
            } else {
              chain.unsetFontSize();
            }
            chain.run();
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Font Size" />
          </SelectTrigger>
          <SelectContent className="max-h-[250px]">
            {fontSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-background-color"),
        renderHTML: (attributes) => {
          return {
            "data-background-color": attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});
const CellSelection = Extension.create({
  name: "cellSelection",
  addCommands() {
    return {
      selectCellContent:
        () =>
        ({ state, dispatch }) => {
          const { schema, selection } = state;
          const cell = findParentNodeOfType(schema.nodes.tableCell)(selection);

          if (cell) {
            const cellStart = cell.pos + 1;
            const cellEnd = cell.pos + cell.node.nodeSize - 1;
            const tr = state.tr.setSelection(
              TextSelection.create(state.doc, cellStart, cellEnd)
            );
            if (dispatch) {
              dispatch(tr);
              return true;
            }
          }
          return false;
        },
    };
  },
});
const CellSelectKeymap = Extension.create({
  name: "cellSelectKeymap",
  addKeyboardShortcuts() {
    return {
      "Mod-a": () => {
        // Check if the cursor is inside a table cell
        if (this.editor.isActive("tableCell")) {
          // If in a cell, try to select the cell's content
          return this.editor.chain().focus().selectCellContent().run();
        }
        return false;
      },
    };
  },
});
export const Note = () => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Blockquote,
      CodeBlock,
      HorizontalRule,
      TextStyle,
      Color,
      FontSize,
      Underline,
      ResizableImage.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      CustomTableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
      FontFamily,
      CellSelectKeymap,
      CellSelection,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none h-full p-4",
      },
      // Modified handlePaste to handle HTML with image tags
      // eslint-disable-next-line
      handlePaste(eview, event, slice) {
        const items = Array.from(event.clipboardData?.items || []);

        // Handle raw image files (from outside the editor)
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  editor
                    ?.chain()
                    .focus()
                    .setImage({ src: e.target.result as string })
                    .run();
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }

        // Handle pasting HTML content (including from within the editor)
        const html = event.clipboardData?.getData("text/html");
        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const img = doc.querySelector("img");

          if (img && img.src) {
            // Check if the image source is a data URL (copied from the editor)
            // or an external URL.
            editor?.chain().focus().setImage({ src: img.src }).run();
            return true;
          }
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => {
      setHasClipboardContent(true);
    };
    editor.on("transaction", handleUpdate);
    return () => {
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);
  const hasSelectedText = () => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  };

  const isImageActive = () => {
    if (!editor) return false;
    return editor.isActive("image");
  };

  const checkClipboardContent = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      if (clipboardItems.length > 0) {
        setHasClipboardContent(true);
      } else {
        setHasClipboardContent(false);
      }
    } catch {
      setHasClipboardContent(false);
    }
  };
  if (!editor) {
    return null;
  }

  const handleContextMenuAction = async (
    action: string,
    editor: TipTapEditor
  ) => {
    if (!editor) return;
    const { state, chain } = editor;
    const { selection, doc } = state;
    if (action === "copy" || action === "cut") {
      // First, check if the entire table is selected.
      const maybeTable = doc.nodeAt(selection.from);
      const isTableSelection =
        maybeTable &&
        maybeTable.type.name === "table" &&
        selection.from === doc.resolve(selection.from).start() - 1 &&
        selection.to === doc.resolve(selection.to).end() + 1;
      if (isTableSelection) {
        // If it's a full table selection, copy the entire table structure.
        const slice = selection.content();
        const serializer = DOMSerializer.fromSchema(state.schema);
        const tempDiv = document.createElement("div");
        tempDiv.appendChild(serializer.serializeFragment(slice.content));

        const html = tempDiv.innerHTML;
        const text = state.doc.textBetween(
          selection.from,
          selection.to,
          "\n\n"
        );
        const listener = (e: ClipboardEvent) => {
          e.preventDefault();
          e.clipboardData?.setData("text/html", html);
          e.clipboardData?.setData("text/plain", text);
        };
        document.addEventListener("copy", listener);
        document.execCommand("copy");
        document.removeEventListener("copy", listener);

        if (action === "cut") {
          chain().focus().deleteSelection().run();
        }
        return;
      }

      // Next, check if a single image is selected (not part of a larger selection).
      if (editor.isActive("image")) {
        const node = selection.content().content.maybeChild(0);
        if (node && node.type.name === "image") {
          const imageSrc = node.attrs.src;
          const imageHtml = `<img src="${imageSrc}" alt="">`;
          const listener = (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData("text/html", imageHtml);
            e.clipboardData?.setData("text/plain", "Image");
          };
          document.addEventListener("copy", listener);
          document.execCommand("copy");
          document.removeEventListener("copy", listener);
          if (action === "cut") {
            chain().focus().deleteSelection().run();
          }
          return;
        }
      }

      // Finally, handle general text and content selections.
      if (selection.empty) return;
      const slice = selection.content();
      const serializer = DOMSerializer.fromSchema(state.schema);
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(serializer.serializeFragment(slice.content));

      const html = tempDiv.innerHTML;
      const text = state.doc.textBetween(selection.from, selection.to, "\n\n");

      const listener = (e: ClipboardEvent) => {
        e.preventDefault();
        e.clipboardData?.setData("text/html", html);
        e.clipboardData?.setData("text/plain", text);
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
      if (action === "cut") {
        chain().focus().deleteSelection().run();
      }
      return;
    }
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    checkClipboardContent();
  };
  return (
    <div className="flex w-full h-dvh flex-col gap-5">
      <header className="flex items-center justify-between p-4 shadow-md rounded-lg m-0">
        <Input
          placeholder="Untitled Note"
          className="font-bold text-gray-800 border-none outline-none text-xl"
        />
      </header>
      <div className="w-full flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-md mb-0.5 ml-0.5">
        <div className="sticky top-0 z-10 bg-white">
          <Toolbar editor={editor} />
        </div>
        {/* Modified this div to handle overflow-y-auto */}
        <div
          className="w-full h-full overflow-y-auto thin-scrollbar"
          onContextMenu={handleContextMenu}
        >
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="h-full w-full p-4"
                onPointerDown={checkClipboardContent}
              >
                <EditorContent editor={editor} className="h-full" />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
              >
                Undo
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
              >
                Redo
              </ContextMenuItem>
              <Separator className="my-1" />
              <ContextMenuItem
                onClick={() => handleContextMenuAction("cut", editor)}
                disabled={!hasSelectedText()}
              >
                Cut
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("copy", editor)}
                disabled={!hasSelectedText()}
              >
                Copy
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() =>
                  /*editor.chain().focus().paste().run()*/
                  document.execCommand("paste")
                }
                disabled={!hasClipboardContent}
              >
                z Paste
              </ContextMenuItem>
              <Separator className="my-1" />
              <ContextMenuItem
                onClick={() => editor.chain().focus().deleteSelection().run()}
              >
                Delete
              </ContextMenuItem>
              <Separator className="my-1" />
              <ContextMenuSub>
                <ContextMenuSubTrigger disabled={!isImageActive()}>
                  Image Options
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-[200px]">
                  <ContextMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNodeSelection(editor.state.selection.from)
                        .setAttributes({ width: "100%" })
                        .run()
                    }
                  >
                    Full Width
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNodeSelection(editor.state.selection.from)
                        .setAttributes({ width: "50%" })
                        .run()
                    }
                  >
                    Half Width
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .setNodeSelection(editor.state.selection.from)
                        .setAttributes({ width: "25%" })
                        .run()
                    }
                  >
                    Quarter Width
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </div>
  );
};
