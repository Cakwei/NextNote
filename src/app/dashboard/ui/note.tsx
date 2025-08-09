"use client";
import React, {
  useState,
  FC,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
  MouseEventHandler,
} from "react";
import {
  useEditor,
  EditorContent,
  Editor as TipTapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
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
import Strike from "@tiptap/extension-strike";
import TextIndent from "@tiptap/extension-indent"; // hypothetical - if unavailable you can implement custom commands
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import SuperScript from "@tiptap/extension-superscript";
import { Bold, Italic, Underline as LucideUnderline, Image as LucideImage, ListTodo, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link as LucideLink, List, ListOrdered, Undo, Redo, Palette, Table as LucideTable, Columns, Rows, Trash2, Save, Download, Search, SkipForward, Indent, Outdent, Type } from "lucide-react";
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
import { Extension, getHTMLFromFragment } from "@tiptap/core";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";

/** -----------------------------
 *  Types & small utilities
 *  ----------------------------- */
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
  }
}

/** -----------------------------
 *  Custom TableCell + Keymap (same as yours)
 *  ----------------------------- */
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
  addCommands() {
    return {
      selectCellContent:
        () =>
        ({
          tr,
          state,
          dispatch,
        }: {
          tr: Transaction;
          state: EditorState;
          dispatch?: (tr: Transaction) => void;
        }) => {
          const { $anchor } = state.selection;
          const parentCell = $anchor.blockRange()?.parent;

          if (
            parentCell &&
            ["tableCell", "tableHeader"].includes(parentCell.type.name)
          ) {
            const start = $anchor.start();
            const end = $anchor.end();
            const newSelection = TextSelection.create(state.doc, start, end);
            tr.setSelection(newSelection);
            if (dispatch) {
              dispatch(tr);
            }
            return true;
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
      "Mod-a": () => this.editor.commands.selectCellContent(),
    };
  },
});

/** -----------------------------
 *  Toolbar component extended with many Word-like features
 *  ----------------------------- */
const Toolbar: FC<ToolbarProps> = ({ editor }) => {
  const [fontSearch, setFontSearch] = useState("");
  const filteredFonts = fontFamilies.filter((font) =>
    font.label.toLowerCase().includes(fontSearch.toLowerCase())
  );
  const [buttonStates, setButtonStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isTextColorModalOpen, setIsTextColorModalOpen] = useState(false);
  const [isCellColorModalOpen, setIsCellColorModalOpen] = useState(false);
  const [isCustomTextColorModalOpen, setIsCustomTextColorModalOpen] =
    useState(false);
  const [customColor, setCustomColor] = useState("#000000");
  const [activeColor, setActiveColor] = useState("#000000");
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [findTerm, setFindTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [lineHeight, setLineHeight] = useState<string>("1.5");
  const [highlightColor, setHighlightColor] = useState<string>("#fff59d");

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
      });
      const currentTextColor =
        (editor.getAttributes("textStyle") as any).color || "#000000";
      setActiveColor(currentTextColor);
    };
    editor.on("selectionUpdate", handleUpdate);
    editor.on("transaction", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("transaction", handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  /** Image upload */
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

  /** Links */
  const openLinkModal = () => {
    const currentLink = editor.getAttributes("link").href;
    setLinkUrl(currentLink || "");
    setIsLinkModalOpen(true);
  };

  const applyLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl, target: "_blank" })
        .run();
    }
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  /** Color handlers */
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleTextColorChange = (color: string) => {
    setActiveColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const handleHighlight = (color: string) => {
    setHighlightColor(color);
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  /** Strikethrough, super/subscript */
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleSuperscript = () =>
    editor.chain().focus().toggleSuperscript().run();
  const toggleSubscript = () => editor.chain().focus().toggleSubscript().run();

  /** Indent/outdent - fallback using sinkListItem / liftListItem if not available; here use custom indent commands */
  const increaseIndent = () => {
    editor.chain().focus().command(({ tr, state, dispatch }) => {
      // simple approach: wrap selection in blockquote to simulate indent
      editor.chain().focus().sinkListItem("paragraph").run();
      return true;
    }).run();
  };
  const decreaseIndent = () => {
    editor.chain().focus().command(({ tr, state, dispatch }) => {
      editor.chain().focus().liftListItem("paragraph").run();
      return true;
    }).run();
  };

  /** Line height (applies with textStyle attribute) */
  const handleSetLineHeight = (value: string) => {
    setLineHeight(value);
    editor.chain().focus().setTextStyle({ lineHeight: value }).run();
  };

  /** Find & Replace (simple naive implementation) */
  const handleFindReplace = () => {
    if (!findTerm) return;
    const json = editor.getJSON();
    // naive traversal: convert to html and string replace (works for plain text)
    const html = editor.getHTML();
    const replaced = html.split(findTerm).join(replaceTerm);
    editor.chain().focus().setContent(replaced).run();
    setIsFindReplaceOpen(false);
    setFindTerm("");
    setReplaceTerm("");
  };

  /** Export JSON */
  const exportJSONFormat = () => {
    const blob = new Blob([JSON.stringify(editor?.getJSON() || {})], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "note.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Insert page break (we insert a custom horizontal rule and a div hint) */
  const insertPageBreak = () => {
    editor.chain().focus().setHorizontalRule().run();
    // add a page break marker
    editor.chain().focus().insertContent(`<div data-page-break="true"><br/></div>`).run();
  };

  /** Print */
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center space-x-2 p-4 bg-[#f9f9f9] border-b border-zinc-400 flex-wrap gap-2">
      {/* Basic formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md ${
          editor.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md ${
          editor.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded-md ${
          editor.isActive("underline") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Underline"
      >
        <LucideUnderline size={16} />
      </button>
      <button
        onClick={() => toggleStrike()}
        className={`p-2 rounded-md ${
          editor.isActive("strike") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Strikethrough"
      >
        <Type size={16} />
      </button>

      {/* superscript / subscript */}
      <button
        onClick={() => toggleSuperscript()}
        className={`p-2 rounded-md ${
          editor.isActive("superscript") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Superscript"
      >
        X<sup>2</sup>
      </button>
      <button
        onClick={() => toggleSubscript()}
        className={`p-2 rounded-md ${
          editor.isActive("subscript") ? "bg-gray-200" : "hover:bg-gray-100"
        }`}
        title="Subscript"
      >
        X<sub>2</sub>
      </button>

      {/* Image */}
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

      {/* Table */}
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

      {/* Lists */}
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

      {/* Indent related */}
      <button onClick={increaseIndent} className="p-2 rounded-md hover:bg-gray-100" title="Increase Indent">
        <Indent size={16} />
      </button>
      <button onClick={decreaseIndent} className="p-2 rounded-md hover:bg-gray-100" title="Decrease Indent">
        <Outdent size={16} />
      </button>

      {/* Text align */}
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

      {/* Undo / Redo */}
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

      {/* Color and highlight */}
      <Dialog open={isTextColorModalOpen} onOpenChange={setIsTextColorModalOpen}>
        <DialogTrigger asChild>
          <button className="p-2 rounded-md hover:bg-gray-100" title="Text Color">
            <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: activeColor }} />
          </button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Text Color</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button key={color} onClick={() => { handleTextColorChange(color); setIsTextColorModalOpen(false); }} className={`w-8 h-8 rounded-full border-2 ${activeColor === color ? "border-3 border-blue-500" : "border-transparent hover:border-zinc-400"}`} style={{ backgroundColor: color }} title={color} />
              ))}
              <button onClick={() => setIsCustomTextColorModalOpen(true)} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-zinc-400 flex items-center justify-center" title="Custom Color"><Palette size={16} /></button>
            </div>
            <Separator />
            <h3 className="text-md font-medium text-gray-600 mb-2">Highlight</h3>
            <div className="grid grid-cols-8 gap-2">
              {["#fff59d", "#ffcc80", "#b3e5fc", "#c8e6c9", "#ffcdd2", "#e1bee7"].map((c) => (
                <button key={c} onClick={() => { handleHighlight(c); setIsTextColorModalOpen(false); }} className="w-8 h-8 rounded-full border-2 hover:border-zinc-400" style={{ backgroundColor: c }} title={`Highlight ${c}`} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom color dialog */}
      <Dialog open={isCustomTextColorModalOpen} onOpenChange={setIsCustomTextColorModalOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Choose Color</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative flex h-20 w-full items-center rounded-md border border-input">
              <div className="h-full w-full rounded-[4px]" style={{ backgroundColor: customColor }} />
              <Input type="color" value={customColor} onChange={handleCustomColorChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            </div>
            <Button onClick={() => { handleTextColorChange(customColor); setIsCustomTextColorModalOpen(false); }}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Heading & font family/size */}
      <div className="relative flex gap-2 max-[850px]:justify-start max-[850px]:w-full">
        <Select value={editor.getAttributes("heading").level ? `h${(editor.getAttributes("heading") as any).level}` : ""} onValueChange={(val) => {
          if (!val) return editor.chain().focus().setParagraph().run();
          const level = parseInt(val.replace("h", ""), 10);
          editor.chain().focus().toggleHeading({ level }).run();
        }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Normal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
          </SelectContent>
        </Select>

        <Select value={editor.getAttributes("textStyle").fontFamily || ""} onValueChange={(value) => {
          const chain = editor.chain().focus();
          if (value) chain.setFontFamily(value);
          else chain.unsetFontFamily();
          chain.run();
        }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Font" /></SelectTrigger>
          <SelectContent className="max-h-[250px]">
            {filteredFonts.map((font) => (<SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select value={editor.getAttributes("textStyle").fontSize || ""} onValueChange={(value) => {
          const chain = editor.chain().focus();
          if (value) chain.setFontSize(value);
          else chain.unsetFontSize();
          chain.run();
        }}>
          <SelectTrigger className="w-[120px]"><SelectValue placeholder="Font Size" /></SelectTrigger>
          <SelectContent className="max-h-[250px]">
            {fontSizes.map((size) => (<SelectItem key={size} value={size}>{size}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Line height */}
      <Select value={lineHeight} onValueChange={(val) => handleSetLineHeight(val)}>
        <SelectTrigger className="w-[100px]"><SelectValue placeholder="Line height" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="1.15">1.15</SelectItem>
          <SelectItem value="1.5">1.5</SelectItem>
          <SelectItem value="2">2</SelectItem>
        </SelectContent>
      </Select>

      {/* Find & Replace + Print + export */}
      <button onClick={() => setIsFindReplaceOpen(true)} className="p-2 rounded-md hover:bg-gray-100" title="Find & Replace"><Search size={16} /></button>
      <Dialog open={isFindReplaceOpen} onOpenChange={setIsFindReplaceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Find & Replace</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Input placeholder="Find" value={findTerm} onChange={(e) => setFindTerm(e.target.value)} />
            <Input placeholder="Replace with" value={replaceTerm} onChange={(e) => setReplaceTerm(e.target.value)} />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsFindReplaceOpen(false)}>Cancel</Button>
              <Button onClick={handleFindReplace}>Replace All</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button onClick={insertPageBreak} className="p-2 rounded-md hover:bg-gray-100" title="Insert Page Break">Page Break</button>
      <button onClick={handlePrint} className="p-2 rounded-md hover:bg-gray-100" title="Print"><SkipForward size={16} /></button>

      <button onClick={exportJSONFormat} className={`w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center`} title="Save">
        <Save size={16} color={"black"} />
      </button>

      <button onClick={() => {
        let json = prompt("Paste JSON content to load");
        if (!json) return;
        try {
          const parsed = JSON.parse(json);
          editor.commands.setContent(parsed);
        } catch (err) {
          alert("Invalid JSON");
        }
      }} className={`w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center`} title="Load JSON">
        <Download size={16} color={"black"} />
      </button>
    </div>
  );
};

/** -----------------------------
 *  Main Note component — added:
 *  - header/footer areas
 *  - footnotes state and insertion
 *  - comments state and UI
 *  - context menu hooks (reuse your logic)
 *  ----------------------------- */
export const Note = () => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const [renderCounter, setRenderCounter] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [headerHTML, setHeaderHTML] = useState("<p>Your header</p>");
  const [footerHTML, setFooterHTML] = useState("<p>Page 1</p>");
  const [footnotes, setFootnotes] = useState<{ id: string; text: string }[]>(
    []
  );
  const [comments, setComments] = useState<
    { id: string; from: number; to: number; text: string }[]
  >([]);
  const [renderedDocumentKey, setRenderedDocumentKey] = useState(0);

  const editor = useEditor({
    enableContentCheck: true,
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      TextStyle,
      Color,
      FontSize,
      ResizableImage.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      CustomTableCell.configure({
        HTMLAttributes: {
          style: "background-color: transparent",
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
      FontFamily,
      CellSelectKeymap,
      Strike,
      Highlight.configure({ multicolor: true }),
      SubScript,
      SuperScript,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none h-full p-4 bordered-table-container",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.chain().run();
      const handleUpdate = () => {
        setRenderCounter((prev) => prev + 1);
      };
      editor.on("selectionUpdate", handleUpdate);
      editor.on("transaction", handleUpdate);
      return () => {
        editor.off("selectionUpdate", handleUpdate);
        editor.off("transaction", handleUpdate);
      };
    }
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
      const text = await navigator.clipboard.readText();
      setHasClipboardContent(!!text);
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
      setHasClipboardContent(false);
    }
  };

  if (!editor) {
    return null;
  }

  /** Context menu actions (keep your logic & expand) */
  const handleContextMenuAction = (action: string, editor: TipTapEditor) => {
    if (!editor) return;

    const handleCopyAndCut = async () => {
      try {
        const { from, to } = editor.state.selection;
        if (from === to) return;
        const selectedFragment = editor.state.doc.slice(from, to).content;
        const htmlContent = getHTMLFromFragment(selectedFragment, editor.schema);
        const htmlBlob = new Blob([htmlContent], { type: "text/html" });
        const textContent = editor.state.doc.textBetween(from, to, "\n");
        const textBlob = new Blob([textContent], { type: "text/plain" });
        const clipboardItem = new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
        if (action === "cut") {
          editor.chain().focus().deleteSelection().run();
        }
      } catch (err) {
        console.error("Failed to copy/cut content:", err);
      }
    };

    const handlePaste = async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          if (item.types.includes("text/html")) {
            const blob = await item.getType("text/html");
            const htmlText = await blob.text();
            editor.chain().focus().insertContent(htmlText).run();
            return;
          }
        }
        const plainText = await navigator.clipboard.readText();
        if (plainText) {
          editor.chain().focus().insertContent(plainText).run();
        }
      } catch (err) {
        console.error("Failed to paste content:", err);
      }
    };

    if (action === "cut" || action === "copy") {
      handleCopyAndCut();
    } else if (action === "paste") {
      handlePaste();
    } else if (action === "delete") {
      editor.chain().focus().deleteSelection().run();
    } else if (action === "deleteImage") {
      editor.chain().focus().deleteSelection().run();
    } else if (action === "addRowBefore") {
      editor.chain().focus().addRowBefore().run();
    } else if (action === "addRowAfter") {
      editor.chain().focus().addRowAfter().run();
    } else if (action === "deleteRow") {
      editor.chain().focus().deleteRow().run();
    } else if (action === "addColumnBefore") {
      editor.chain().focus().addColumnBefore().run();
    } else if (action === "addColumnAfter") {
      editor.chain().focus().addColumnAfter().run();
    } else if (action === "deleteColumn") {
      editor.chain().focus().deleteColumn().run();
    } else if (action === "deleteTable") {
      editor.chain().focus().deleteTable().run();
    } else if (action === "insertFootnote") {
      const { from, to } = editor.state.selection;
      if (from === to) return;
      const id = Date.now().toString();
      const text = prompt("Footnote text") || "";
      if (!text) return;
      setFootnotes((f) => [...f, { id, text }]);
      // insert superscript marker that links to footnote area (simple)
      editor.chain().focus().insertContentAt(to, `<sup data-footnote-id="${id}">[${footnotes.length + 1}]</sup>`).run();
    } else if (action === "addComment") {
      const { from, to } = editor.state.selection;
      if (from === to) return;
      const text = prompt("Comment text") || "";
      if (!text) return;
      const id = Date.now().toString();
      setComments((c) => [...c, { id, from, to, text }]);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    checkClipboardContent();
  };

  /** Render comments list to the right */
  const CommentsPane = () => (
    <aside className="w-64 p-2 border-l">
      <h4 className="font-semibold">Comments</h4>
      {comments.length === 0 && <p className="text-sm text-gray-500">No comments</p>}
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="p-2 border rounded">
            <div className="text-sm text-gray-700">{c.text}</div>
            <div className="text-xs text-gray-400 mt-1">Selection: {c.from}-{c.to}</div>
            <div className="mt-1 flex gap-2">
              <Button size="sm" onClick={() => {
                // select the commented range
                editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, c.from, c.to)));
                editor.view.focus();
              }}>Go</Button>
              <Button size="sm" variant="ghost" onClick={() => setComments((s) => s.filter(x => x.id !== c.id))}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );

  return (
    <>
      <div className="flex w-full h-dvh flex-col gap-5">
        <header className="flex items-center justify-between p-4 shadow-md rounded-lg m-0">
          <Input className="font-bold text-gray-800 border-none outline-none text-xl" placeholder="Document title..." />
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showHeader} onChange={() => setShowHeader(s => !s)} /> Header
            </label>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={showFooter} onChange={() => setShowFooter(s => !s)} /> Footer
            </label>
          </div>
        </header>

        <div className="w-full flex-1 flex flex-row gap-4 overflow-hidden bg-white rounded-lg shadow-md mb-0.5 ml-0.5">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="sticky top-0 z-10 bg-white">
              <Toolbar editor={editor} />
            </div>

            {/* page header (simple contenteditable) */}
            {showHeader && (
              <div className="p-2 border-b bg-gray-50" contentEditable={false}>
                <div dangerouslySetInnerHTML={{ __html: headerHTML }} />
                <div className="mt-1 flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => {
                    const html = prompt("Edit header HTML", headerHTML);
                    if (html !== null) setHeaderHTML(html);
                  }}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setHeaderHTML("<p></p>")}>Clear</Button>
                </div>
              </div>
            )}

            <div className="w-full h-full" onContextMenu={handleContextMenu}>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="h-full w-full p-4 bordered-table-container" onPointerDown={() => { checkClipboardContent(); }}>
                    <EditorContent editor={editor} className="h-full" />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {isImageActive() ? (
                    <>
                      <ContextMenuItem onClick={() => handleContextMenuAction("cut", editor)}>Cut</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("copy", editor)}>Copy</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("deleteImage", editor)}><Trash2 className="mr-2 h-4 w-4" />Delete Image</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("addComment", editor)}>Add Comment</ContextMenuItem>
                    </>
                  ) : editor.isActive("table") ? (
                    <>
                      <ContextMenuItem onClick={() => handleContextMenuAction("cut", editor)}>Cut</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("copy", editor)}>Copy</ContextMenuItem>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger><Rows className="mr-2 h-4 w-4" /><span>Row</span></ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                          <ContextMenuItem onClick={() => handleContextMenuAction("addRowBefore", editor)}>Add Row Above</ContextMenuItem>
                          <ContextMenuItem onClick={() => handleContextMenuAction("addRowAfter", editor)}>Add Row Below</ContextMenuItem>
                          <ContextMenuItem onClick={() => handleContextMenuAction("deleteRow", editor)}>Delete Row</ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger><Columns className="mr-2 h-4 w-4" /><span>Column</span></ContextMenuSubTrigger>
                        <ContextMenuSubContent>
                          <ContextMenuItem onClick={() => handleContextMenuAction("addColumnBefore", editor)}>Add Column Left</ContextMenuItem>
                          <ContextMenuItem onClick={() => handleContextMenuAction("addColumnAfter", editor)}>Add Column Right</ContextMenuItem>
                          <ContextMenuItem onClick={() => handleContextMenuAction("deleteColumn", editor)}>Delete Column</ContextMenuItem>
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuItem style={{ color: "red" }} onClick={() => handleContextMenuAction("deleteTable", editor)}>Delete Table</ContextMenuItem>
                    </>
                  ) : (
                    <>
                      <ContextMenuItem onClick={() => handleContextMenuAction("cut", editor)} disabled={!hasSelectedText()}>Cut</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("copy", editor)} disabled={!hasSelectedText()}>Copy</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("paste", editor)} disabled={!hasClipboardContent}>Paste</ContextMenuItem>
                      <ContextMenuItem style={{ color: "red" }} onClick={() => handleContextMenuAction("delete", editor)} disabled={!hasSelectedText()}>Delete</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("insertFootnote", editor)} disabled={!hasSelectedText()}>Insert Footnote</ContextMenuItem>
                      <ContextMenuItem onClick={() => handleContextMenuAction("addComment", editor)} disabled={!hasSelectedText()}>Add Comment</ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            </div>

            {/* footer */}
            {showFooter && (
              <div className="p-2 border-t bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: footerHTML }} />
                <div className="mt-1">
                  <Button size="sm" variant="ghost" onClick={() => {
                    const html = prompt("Edit footer HTML", footerHTML);
                    if (html !== null) setFooterHTML(html);
                  }}>Edit Footer</Button>
                </div>
              </div>
            )}

            {/* footnotes rendering */}
            {footnotes.length > 0 && (
              <div className="p-4 border-t bg-gray-100">
                <h4 className="font-semibold">Footnotes</h4>
                <ol className="ml-4 list-decimal">
                  {footnotes.map((f, idx) => (
                    <li key={f.id} className="text-sm text-gray-700">{f.text}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* comments pane */}
          <CommentsPane />
        </div>
      </div>
    </>
  );
};