import { useState, FormEvent } from "react";
import type { PortfolioSection } from "@/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Combobox } from "@/components/ui/combobox";
import type { PathOption } from "./types";

export interface SectionEditorSheetProps {
  section: Partial<PortfolioSection> | null;
  availablePaths: PathOption[];
  onSave: (data: Partial<PortfolioSection>) => void;
  onClose: () => void;
}

export default function SectionEditorSheet({
  section,
  availablePaths,
  onSave,
  onClose,
}: SectionEditorSheetProps) {
  const [pagePath, setPagePath] = useState(section?.page_path || "/");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      id: section?.id,
      title: formData.get("title") as string,
      page_path: pagePath,
      type: formData.get("type") as PortfolioSection["type"],
      layout_style: formData.get("layout_style") as string,
    });
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg w-full flex flex-col">
        <div className="flex justify-between items-center">
          <SheetHeader>
            <SheetTitle>
              {section?.id ? "Edit Section" : "Create New Section"}
            </SheetTitle>
            <SheetDescription>
              Configure the section's properties and placement.
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          <div className="space-y-1">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={section?.title || ""}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>Page Path *</Label>
            <Combobox
              options={availablePaths}
              value={pagePath}
              onChange={setPagePath}
              placeholder="Select or create path..."
              searchPlaceholder="Search paths..."
              emptyPlaceholder="No paths."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="type">Content Type</Label>
              <Select
                name="type"
                defaultValue={section?.type || "list_items"}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="list_items">List of Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="layout_style">Layout Style</Label>
              <Select
                name="layout_style"
                defaultValue={section?.layout_style || "default"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="grid-2-col">Grid - 2 Columns</SelectItem>
                  <SelectItem value="feature-alternating">
                    Featured Projects
                  </SelectItem>
                  <SelectItem value="github-grid">GitHub Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Section</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
