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
import {
  Bold,
  Italic,
  Underline as LucideUnderline,
  Image as LucideImage,
  ListTodo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LucideLink,
  List,
  ListOrdered,
  Undo,
  Redo,
  Palette,
  Table as LucideTable,
  Columns,
  Rows,
  Trash2,
  Save,
  Download,
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
import { Extension, getHTMLFromFragment } from "@tiptap/core";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";

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

const Toolbar: FC<ToolbarProps> = ({ editor }) => {
  const [fontSearch, setFontSearch] = useState("");
  const filteredFonts = fontFamilies.filter((font) =>
    font.label.toLowerCase().includes(fontSearch.toLowerCase())
  );
  const [buttonStates, setButtonStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [renderCount, setRenderCount] = useState(0);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isTextColorModalOpen, setIsTextColorModalOpen] = useState(false);
  const [isCellColorModalOpen, setIsCellColorModalOpen] = useState(false);
  const [isCustomTextColorModalOpen, setIsCustomTextColorModalOpen] =
    useState(false);
  const [customColor, setCustomColor] = useState("#000000");
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
      });
      const currentTextColor =
        editor.getAttributes("textStyle").color || "#000000";
      setActiveColor(currentTextColor);
      setRenderCount((prev) => prev + 1);
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

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
  };

  const applyCustomTextColor = () => {
    handleTextColorChange(customColor);
    setIsCustomTextColorModalOpen(false);
  };

  const applyCustomCellColor = () => {
    handleCellColorChange(customColor);
    setIsCellColorModalOpen(false);
  };

  const handleTextColorChange = (color: string) => {
    setActiveColor(color);

    const { selection } = editor.state;
    const isSelectionEmpty = selection.empty;
    const isInsideTable =
      editor.isActive("tableCell") || editor.isActive("tableHeader");

    if (isInsideTable && isSelectionEmpty) {
      editor
        .chain()
        .focus()
        .command(({ tr, state, dispatch }) => {
          const { from } = state.selection;
          const mark = state.schema.marks.textStyle.create({ color });
          tr.addMark(from, from, mark);

          if (dispatch) {
            dispatch(tr);
          }
          return true;
        })
        .run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
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
    console.log(blob);
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
      {/* Formatting Buttons */}
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
        <button
          onClick={exportJSONFormat}
          className={`w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center`}
          title="Save"
        >
          <Save size={16} color={"black"} />
        </button>
        <button
          onClick={() => {
            let json = prompt("ewvw");
            json = JSON.parse(json || "");
            editor.commands.setContent(json);
          }}
          className={`w-8 h-8 rounded-full border-2 border-transparent flex items-center justify-center`}
          title="Export Notes"
        >
          <Download size={16} color={"black"} />
        </button>
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

      <Dialog
        open={isCustomTextColorModalOpen}
        onOpenChange={setIsCustomTextColorModalOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Select a Custom Text Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative flex h-20 w-full items-center rounded-md border border-input bg-transparent focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <div
                className="h-full w-full rounded-[4px] transition-colors"
                style={{ backgroundColor: customColor }}
              ></div>
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <Button
              onClick={applyCustomTextColor}
              className="mt-2 p-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Apply to Text
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCellColorModalOpen}
        onOpenChange={setIsCellColorModalOpen}
      >
        <DialogContent
          aria-describedby={undefined}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Select a Custom Cell Color</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative flex h-20 w-full items-center rounded-md border border-input bg-transparent focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <div
                className="h-full w-full rounded-[4px] transition-colors"
                style={{ backgroundColor: customColor }}
              ></div>
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <Button
              onClick={applyCustomCellColor}
              disabled={!isTableActive}
              className={`mt-2 p-2.5 rounded-md ${
                isTableActive
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Apply to Cell
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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

export const Note = () => {
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const [renderCounter, setRenderCounter] = useState(0);

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

  const handleContextMenuAction = (action: string, editor: TipTapEditor) => {
    if (!editor) return;

    const handleCopyAndCut = async () => {
      try {
        const { from, to } = editor.state.selection;

        // Get the selected content as a Prosemirror Fragment
        const selectedFragment = editor.state.doc.slice(from, to).content;

        // Use the helper function to get the HTML from the fragment
        const htmlContent = getHTMLFromFragment(
          selectedFragment,
          editor.schema
        );

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
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    checkClipboardContent();
  };

  return (
    <>
      <div className="flex w-full h-dvh flex-col gap-5">
        <header className="flex items-center justify-between p-4 shadow-md rounded-lg m-0">
          <Input className="font-bold text-gray-800 border-none outline-none text-xl" />
        </header>
        <div className="w-full flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-md mb-0.5 ml-0.5">
          <div className="sticky top-0 z-10 bg-white">
            <Toolbar editor={editor} />
          </div>
          <div className="w-full h-full" onContextMenu={handleContextMenu}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div
                  className="h-full w-full p-4 bordered-table-container"
                  onPointerDown={() => {
                    checkClipboardContent();
                  }}
                >
                  <EditorContent editor={editor} className="h-full" />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {isImageActive() ? (
                  <>
                    <ContextMenuItem
                      onClick={() => handleContextMenuAction("cut", editor)}
                    >
                      Cut
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleContextMenuAction("copy", editor)}
                    >
                      Copy
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() =>
                        handleContextMenuAction("deleteImage", editor)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Image
                    </ContextMenuItem>
                  </>
                ) : editor.isActive("table") ? (
                  <>
                    <ContextMenuItem
                      onClick={() => handleContextMenuAction("cut", editor)}
                    >
                      Cut
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleContextMenuAction("copy", editor)}
                    >
                      Copy
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Rows className="mr-2 h-4 w-4" />
                        <span>Row</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("addRowBefore", editor)
                          }
                        >
                          Add Row Above
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("addRowAfter", editor)
                          }
                        >
                          Add Row Below
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("deleteRow", editor)
                          }
                        >
                          Delete Row
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Columns className="mr-2 h-4 w-4" />
                        <span>Column</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("addColumnBefore", editor)
                          }
                        >
                          Add Column Left
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("addColumnAfter", editor)
                          }
                        >
                          Add Column Right
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() =>
                            handleContextMenuAction("deleteColumn", editor)
                          }
                        >
                          Delete Column
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem
                      style={{ color: "red" }}
                      onClick={() =>
                        handleContextMenuAction("deleteTable", editor)
                      }
                    >
                      Delete Table
                    </ContextMenuItem>
                  </>
                ) : (
                  <>
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
                      onClick={() => handleContextMenuAction("paste", editor)}
                      disabled={!hasClipboardContent}
                    >
                      Paste
                    </ContextMenuItem>
                    <ContextMenuItem
                      style={{ color: "red" }}
                      onClick={() => handleContextMenuAction("delete", editor)}
                      disabled={!hasSelectedText()}
                    >
                      Delete
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </div>
    </>
  );
};
