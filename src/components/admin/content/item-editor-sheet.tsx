import { useState, FormEvent } from "react";
import type { PortfolioItem } from "@/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import NovelEditor from "@/components/admin/novel-editor";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

export interface ItemEditorSheetProps {
  item: Partial<PortfolioItem> | null;
  sectionId: string;
  onSave: (data: Partial<PortfolioItem>, sectionId: string) => void;
  onClose: () => void;
}

export default function ItemEditorSheet({
  item,
  sectionId,
  onSave,
  onClose,
}: ItemEditorSheetProps) {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    subtitle: item?.subtitle || "",
    date_from: item?.date_from || "",
    date_to: item?.date_to || "",
    description: item?.description || "",
    link_url: item?.link_url || "",
    image_url: item?.image_url || "",
    tags: item?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: Partial<PortfolioItem> = {
      id: item?.id,
      title: formData.title,
      subtitle: formData.subtitle || null,
      date_from: formData.date_from || null,
      date_to: formData.date_to || null,
      description: formData.description || null,
      link_url: formData.link_url || null,
      image_url: formData.image_url || null,
      tags:
        formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean) || null,
    };
    onSave(data, sectionId);
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      {/* Mobile: w-full, Tablet+: max-w-lg */}
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 gap-0">
        <div className="flex justify-between items-center p-6 border-b">
          <SheetHeader className="text-left">
            <SheetTitle>
              {item?.id ? "Edit Item" : "Create New Item"}
            </SheetTitle>
            <SheetDescription>
              Fill in the details for this portfolio item.
            </SheetDescription>
          </SheetHeader>
          <SheetClose asChild>
            <Button type="button" variant="ghost">
              <X />
            </Button>
          </SheetClose>
        </div>

        {/* Scrollable Form Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <form id="item-form" onSubmit={handleSubmit} className="space-y-4">
              <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4 pb-4">
                  <div className="space-y-1">
                    <Label htmlFor="item_title">Title *</Label>
                    <Input
                      id="item_title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item_subtitle">Subtitle</Label>
                    <Input
                      id="item_subtitle"
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, subtitle: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="item_date_from">From</Label>
                      <Input
                        id="item_date_from"
                        value={formData.date_from}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            date_from: e.target.value,
                          }))
                        }
                        placeholder="e.g., Jan 2022"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="item_date_to">To</Label>
                      <Input
                        id="item_date_to"
                        value={formData.date_to}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            date_to: e.target.value,
                          }))
                        }
                        placeholder="e.g., Present"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item_description">Description</Label>
                    <NovelEditor
                      value={formData.description}
                      onChange={(value) =>
                        setFormData((f) => ({ ...f, description: value }))
                      }
                      placeholder="Describe this item..."
                      minHeight="200px"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item_link_url">Link URL</Label>
                    <Input
                      id="item_link_url"
                      value={formData.link_url}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, link_url: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item_image_url">Image URL</Label>
                    <Input
                      id="item_image_url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData((f) => ({
                          ...f,
                          image_url: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item_tags">Tags (comma-separated)</Label>
                    <Input
                      id="item_tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, tags: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </ScrollArea>
            </form>
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background mt-auto">
          <Button type="submit" form="item-form" className="w-full">
            Save Item
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
