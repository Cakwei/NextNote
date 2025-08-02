"use client";
import React, { useState, FC, useEffect, useRef, ChangeEvent } from "react";
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
import Image from "@tiptap/extension-image";
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
  Paintbrush,
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

interface ToolbarProps {
  editor: TipTapEditor | null;
}

const Toolbar: FC<ToolbarProps> = ({ editor }) => {
  const [fontSearch, setFontSearch] = useState(""); // eslint-disable-line
  const filteredFonts = fontFamilies.filter((font) =>
    font.label.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // eslint-disable-next-line
  const [buttonStates, setButtonStates] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const [renderCount, setRenderCount] = useState(0); // eslint-disable-line
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

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

      {/* New Feature Buttons */}
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
        <DialogContent className="sm:max-w-[425px]">
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

      {/* Table Action Buttons - Conditionally Rendered */}
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

      {/* Text Alignment Buttons */}
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

      {/* Undo/Redo Buttons */}
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

      {/* Font Family and Font Size dropdowns */}
      <div className="relative flex gap-2 max-[850px]:justify-start max-[850px]:w-full">
        {/*<Input
          type="text"
          placeholder="Search fonts..."
          value={fontSearch}
          onChange={(e) => setFontSearch(e.target.value)}
          className="w-[140px]"
        />*/}
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

interface SidebarProps {
  editor: TipTapEditor | null;
  activeColor: string;
  onColorChange: (color: string) => void;
  onCellColorChange: (color: string) => void;
}

const Sidebar: FC<SidebarProps> = ({
  editor,
  activeColor,
  onColorChange,
  onCellColorChange,
}) => {
  const [isTextColorModalOpen, setIsTextColorModalOpen] = useState(false);
  const [isCellColorModalOpen, setIsCellColorModalOpen] = useState(false);
  const [customColor, setCustomColor] = useState("#000000");

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

  if (!editor) {
    return null;
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
  };

  const applyCustomTextColor = () => {
    onColorChange(customColor);
    setIsTextColorModalOpen(false);
  };

  const applyCustomCellColor = () => {
    onCellColorChange(customColor);
    setIsCellColorModalOpen(false);
  };

  const isTableActive = editor.isActive("table");

  return (
    <aside
      className={` max-w-80 w-full min-w-5 bg-white p-4 shadow-xl border-l border-gray-200 h-full overflow-y-auto rounded-lg `}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2  text-gray-700">
        <Paintbrush size={20} />
        Text & Styles
      </h2>
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-600 mb-2">Text Color</h3>
        <div className="grid grid-cols-8 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded-full border-2 ${
                activeColor === color
                  ? "border-3 border-blue-500"
                  : "border-transparent hover:border-zinc-400"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          <Dialog
            open={isTextColorModalOpen}
            onOpenChange={setIsTextColorModalOpen}
          >
            <DialogTrigger asChild>
              <button
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-zinc-400 flex items-center justify-center"
                title="Custom Color"
              >
                <Palette size={16} />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
        </div>
      </div>
      <Separator style={{ marginBottom: "25px" }} />
      {/* New section for table cell background color */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-600 mb-2">Cell Color</h3>
        <div className="grid grid-cols-8 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onCellColorChange(color)}
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
          <Dialog
            open={isCellColorModalOpen}
            onOpenChange={setIsCellColorModalOpen}
          >
            <DialogTrigger asChild>
              <button
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
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
        </div>
      </div>
    </aside>
  );
};

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-background-color"),
        renderHTML: (attributes) => ({
          "data-background-color": attributes.backgroundColor,
          style: attributes.backgroundColor
            ? `background-color: ${attributes.backgroundColor}`
            : null,
        }),
      },
    };
  },
  addCommands() {
    return {
      setCellAttribute:
      // eslint-disable-next-line
        (attributeName: string, attributeValue: any) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          let cellsModified = false;

          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (
              node.type.name === "tableCell" ||
              node.type.name === "tableHeader"
            ) {
              const newAttrs = {
                ...node.attrs,
                [attributeName]: attributeValue,
              };
              tr.setNodeMarkup(pos, null, newAttrs);
              cellsModified = true;
            }
          });

          if (dispatch && cellsModified) {
            dispatch(tr);
            return true;
          }

          return cellsModified;
        },
    };
  },
});

export const Note = () => {
  const [activeColor, setActiveColor] = useState("#000000");
  const [hasClipboardContent, setHasClipboardContent] = useState(false);
  const [renderCount, setRenderCount] = useState(0); // eslint-disable-line

  const content = ``;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      Image.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      CustomTableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: true }),
      FontFamily,
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none h-full p-4 bordered-table-container",
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.chain().focus().run();

      const handleSelectionUpdate = () => {
        setRenderCount((prev) => prev + 1);
      };

      editor.on("selectionUpdate", handleSelectionUpdate);

      return () => {
        editor.off("selectionUpdate", handleSelectionUpdate);
      };
    }
  }, [editor]);

  const hasSelectedText = () => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
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

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const handleCellColorChange = (color: string) => {
    if (editor.isActive("table")) {
      editor.chain().focus().setCellAttribute("backgroundColor", color).run();
    }
  };

  const handleContextMenuAction = (action: string) => {
    if (editor) {
      if (action === "cut" || action === "copy") {
        const selectedText = editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          " "
        );
        if (selectedText) {
          navigator.clipboard.writeText(selectedText);
          if (action === "cut") {
            editor.chain().focus().deleteSelection().run();
          }
        }
      } else if (action === "paste") {
        navigator.clipboard.readText().then((text) => {
          if (text) {
            editor.chain().focus().insertContent(text).run();
          }
        });
      } else if (action === "delete") {
        editor.chain().focus().deleteSelection().run();
      }
    }
  };

  return (
    <div className="flex w-full h-dvh  flex-col gap-5">
      <header className="flex items-center justify-between p-4 shadow-md rounded-lg m-0">
        <Input className="font-bold text-gray-800 border-none outline-none text-xl" />
      </header>
      <div className="flex flex-1 overflow-hidden gap-2.5">
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-md mb-0.5 ml-0.5">
          <div className="sticky top-0 z-10 bg-white">
            <Toolbar editor={editor} />
          </div>
          <div className="w-full h-full">
            <ContextMenu>
              <ContextMenuTrigger
                className="h-full w-full p-4 bordered-table-container"
                onPointerDown={() => {
                  checkClipboardContent();
                }}
              >
                <EditorContent editor={editor} className="h-full" />
              </ContextMenuTrigger>
              {editor.isActive("table") ? (
                <ContextMenuContent>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      <Rows className="mr-2 h-4 w-4" />
                      <span>Row</span>
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem
                        onClick={() =>
                          editor.chain().focus().addRowBefore().run()
                        }
                      >
                        Add Row Above
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          editor.chain().focus().addRowAfter().run()
                        }
                      >
                        Add Row Below
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => editor.chain().focus().deleteRow().run()}
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
                          editor.chain().focus().addColumnBefore().run()
                        }
                      >
                        Add Column Left
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          editor.chain().focus().addColumnAfter().run()
                        }
                      >
                        Add Column Right
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() =>
                          editor.chain().focus().deleteColumn().run()
                        }
                      >
                        Delete Column
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuItem
                    onClick={() => editor.chain().focus().deleteTable().run()}
                  >
                    Delete Table
                  </ContextMenuItem>
                </ContextMenuContent>
              ) : (
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction("cut")}
                    disabled={!hasSelectedText()}
                  >
                    Cut
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction("copy")}
                    disabled={!hasSelectedText()}
                  >
                    Copy
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction("paste")}
                    disabled={!hasClipboardContent}
                  >
                    Paste
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => handleContextMenuAction("delete")}
                    disabled={!hasSelectedText()}
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              )}
            </ContextMenu>
          </div>
        </div>

        <Sidebar
          editor={editor}
          activeColor={activeColor}
          onColorChange={handleColorChange}
          onCellColorChange={handleCellColorChange}
        />
      </div>
    </div>
  );
};
