"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  MoreHorizontal,
  Network,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ThinkingMapSummary } from "@/types";
import {
  MAP_CONFLICT,
  useCreateMapMutation,
  useDeleteMapMutation,
  useGetMapQuery,
  useGetMapsQuery,
  useLazyGetMapQuery,
  useSaveMapDocMutation,
  useUpdateMapMetaMutation,
} from "@/store/api/adminApi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  LoadingState,
  ManagerWrapper,
  PageHeader,
} from "@/components/admin/shared";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/utils";
import { emptyDocument } from "../domain/serialize";
import type { SaveOutcome, SaveRequest } from "../state/autosave";
import { MapEditor } from "./map-editor";

/**
 * /admin/maps — the list of maps, and the editor for one (V2-070).
 *
 * The open map lives in the URL (`?map=<id>`), so a reload reopens it and
 * Back closes it. The editor covers the viewport like the whiteboard's.
 */
export default function MapsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const openId = params?.get("map") ?? null;
  const confirm = useConfirm();
  const [search, setSearch] = useState("");

  const { data: maps = [], isLoading } = useGetMapsQuery();
  const [createMap, { isLoading: creating }] = useCreateMapMutation();
  const [deleteMap] = useDeleteMapMutation();
  const [updateMeta] = useUpdateMapMetaMutation();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? maps.filter((m) => m.name.toLowerCase().includes(term))
      : maps;
  }, [maps, search]);

  const open = (id: string | null) =>
    router.replace(id ? `/admin/maps/?map=${id}` : "/admin/maps/");

  const handleCreate = async () => {
    try {
      const map = await createMap({
        name: "Untitled map",
        doc: emptyDocument(),
      }).unwrap();
      open(map.id);
    } catch (error) {
      toast.error("Couldn't create a map", {
        description: getErrorMessage(error),
      });
    }
  };

  const handleDelete = async (map: ThinkingMapSummary) => {
    const ok = await confirm({
      title: `Delete “${map.name}”?`,
      description: `Its ${map.node_count} nodes and ${map.edge_count} connections are removed permanently. Export it first if you might want it back.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMap(map.id).unwrap();
    } catch (error) {
      toast.error("Couldn't delete the map", {
        description: getErrorMessage(error),
      });
    }
  };

  if (isLoading && maps.length === 0) return <LoadingState />;

  return (
    <ManagerWrapper>
      <PageHeader
        title="Maps"
        description="Map a problem: what's happening, why, what depends on what, and what to do."
        actions={
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Plus className="mr-2 size-4" />
            )}
            New map
          </Button>
        }
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="Search maps…"
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Network}
          title={search ? "No map matches" : "No maps yet"}
          description={
            search
              ? "Try another name."
              : "Start with one question in the middle, then branch out: problems, causes, decisions, actions."
          }
          action={
            search
              ? undefined
              : { label: "New map", onClick: handleCreate, icon: Plus }
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((map) => (
            <li
              key={map.id}
              className="group relative rounded-surface border bg-card shadow-e1 transition-shadow hover:shadow-e2"
            >
              <button
                type="button"
                onClick={() => open(map.id)}
                className="block w-full rounded-surface p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 pr-8">
                  {map.is_pinned && (
                    <Pin
                      aria-label="Pinned"
                      className="size-3.5 shrink-0 text-primary"
                    />
                  )}
                  <span className="truncate font-semibold">{map.name}</span>
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {map.node_count} node{map.node_count === 1 ? "" : "s"} ·{" "}
                  {map.edge_count} connection
                  {map.edge_count === 1 ? "" : "s"}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Edited{" "}
                  {formatDistanceToNow(new Date(map.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`More for ${map.name}`}
                    className="absolute right-2 top-2"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() =>
                      void updateMeta({ id: map.id, is_pinned: !map.is_pinned })
                    }
                  >
                    {map.is_pinned ? (
                      <PinOff className="mr-2 size-4" />
                    ) : (
                      <Pin className="mr-2 size-4" />
                    )}
                    {map.is_pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onSelect={() => void handleDelete(map)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      {openId && <EditorOverlay id={openId} onClose={() => open(null)} />}
    </ManagerWrapper>
  );
}

function EditorOverlay({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: map, isLoading, isError } = useGetMapQuery(id);
  const [saveDoc] = useSaveMapDocMutation();
  const [fetchMap] = useLazyGetMapQuery();

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (isError) {
      toast.error("That map couldn't be opened.");
      onClose();
    }
  }, [isError]);

  const save = async (request: SaveRequest): Promise<SaveOutcome> => {
    const result = await saveDoc({ id, ...request });
    if ("data" in result && result.data)
      return { ok: true, revision: result.data.revision };
    const error =
      "error" in result
        ? (result.error as { code?: string; message?: string })
        : undefined;
    return {
      ok: false,
      conflict: error?.code === MAP_CONFLICT,
      message: error?.message ?? "Save failed",
    };
  };

  const reload = async () => {
    const latest = await fetchMap(id).unwrap();
    return { name: latest.name, doc: latest.doc, revision: latest.revision };
  };

  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={map ? `Map: ${map.name}` : "Map"}
      className="fixed inset-0 z-overlay bg-background"
    >
      {isLoading || !map ? (
        <div className="flex h-full items-center justify-center">
          <Loader2
            aria-label="Loading map"
            className="size-8 animate-spin text-muted-foreground"
          />
        </div>
      ) : (
        <MapEditor
          key={map.id}
          initial={{ name: map.name, doc: map.doc, revision: map.revision }}
          save={save}
          reload={reload}
          onClose={onClose}
        />
      )}
    </div>,
    document.body,
  );
}
