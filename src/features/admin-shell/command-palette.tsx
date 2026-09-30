import * as React from "react";
// Mounted by AdminShell only, after the admin guard passes (V2-024).
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { supabase } from "@/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { startFocus } from "@/store/slices/focusSlice";
import { DARK_THEME, LIGHT_THEME } from "@/lib/themes";
import { NAV_GROUPS } from "@/features/admin-shell/nav-config";
import { requestCreate } from "@/features/admin-shell/create-intent";
import { OPEN_KEYBOARD_MAP } from "@/features/admin-shell/keyboard-map";
import { type SearchKind, useSearchWorkspaceQuery } from "@/store/api/admin/searchApi";
import { cn } from "@/lib/utils"; // Ensure you have this utility
import { Button } from "@/components/ui/button"; // Import Button for the mobile trigger
import {
  User,
  FileText,
  LogOut,
  Moon,
  Sun,
  Plus,
  StickyNote,
  Zap,
  Home,
  Briefcase,
  PenTool,
  Copy,
  Terminal,
  Search,
  ListTodo,
  Mail,
  Keyboard,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { toast } from "sonner";

const HIT_ICONS: Record<SearchKind, React.ComponentType<{ className?: string }>> = {
  note: StickyNote,
  task: ListTodo,
  post: FileText,
  message: Mail,
};
const HIT_LABELS: Record<SearchKind, string> = {
  note: "Note",
  task: "Task",
  post: "Post",
  message: "Message",
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const dispatch = useAppDispatch();

  // Handle Keyboard Shortcut (Cmd+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Handle Custom Event
  React.useEffect(() => {
    const handleCustomOpen = () => setOpen(true);
    document.addEventListener("open-command-palette", handleCustomOpen);
    return () =>
      document.removeEventListener("open-command-palette", handleCustomOpen);
  }, []);

  // Check Admin Status
  React.useEffect(() => {
    const checkUser = async () => {
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAdmin(!!session);
    };
    checkUser();

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(!!session);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Records by title (ADM-027), once typing pauses and there is enough to
  // match on; a single letter would match half the workspace.
  const [query, setQuery] = React.useState("");
  const [term, setTerm] = React.useState("");
  React.useEffect(() => {
    const id = setTimeout(() => setTerm(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);
  // Each opening starts empty.
  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);
  const { data: hits = [], isFetching: searching } = useSearchWorkspaceQuery(term, {
    skip: !isAdmin || !open || term.length < 2,
  });

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/admin/login");
  };

  const copyCurrentUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("URL copied to clipboard");
  };

  const handleQuickFocus = () => {
    dispatch(
      startFocus({ durationMinutes: 25, taskTitle: "Quick Focus Session" }),
    );
    toast.success("Focus Mode Started (25m)");
  };

  return (
    <>
      {/* 
        MOBILE TRIGGER:
        Since mobile users can't press Cmd+K, we add a fixed Floating Action Button.
        Hidden on Desktop (md:hidden).
      */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-overlay h-12 w-12 rounded-full bg-background/80 shadow-e3 backdrop-blur-sm md:hidden"
        aria-label="Open Command Palette"
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder={isAdmin ? "Search notes, tasks, posts, messages, or a command…" : "Type a command or search..."}
          value={query}
          onValueChange={setQuery}
        />

        {/* 
           LAYOUT FIX: 
           On mobile, we use a dynamic height (60vh) so it doesn't get cut off 
           when the keyboard opens, but still leaves room. 
           On desktop, we stick to fixed pixels for a tighter look.
        */}
        <CommandList
          className={cn(
            "overflow-y-auto overflow-x-hidden",
            "max-h-[55vh] sm:max-h-[300px] lg:max-h-[450px]",
          )}
        >
          <CommandEmpty>{searching ? "Searching…" : "No results found."}</CommandEmpty>

          {isAdmin && term.length >= 2 && hits.length > 0 && (
            <>
              <CommandGroup heading="In your workspace">
                {hits.map((hit) => {
                  const Icon = HIT_ICONS[hit.kind];
                  return (
                    <CommandItem
                      key={`${hit.kind}-${hit.id}`}
                      // Unique per record, and contains the title so cmdk's
                      // own filter keeps what the database matched.
                      value={`${hit.title} ${hit.kind}-${hit.id}`}
                      onSelect={() => runCommand(() => router.push(hit.href))}
                    >
                      <Icon className="mr-2 h-4 w-4" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{hit.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{HIT_LABELS[hit.kind]}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {isAdmin && (
            <>
              <CommandGroup heading="Quick Actions">
                <CommandItem
                  onSelect={() =>
                    runCommand(() => requestCreate("post", router.push))
                  }
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  <span>Write New Post</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => requestCreate("task", router.push))}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Add Task</span>
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => requestCreate("note", router.push))}
                >
                  <StickyNote className="mr-2 h-4 w-4" />
                  <span>Jot Note</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    runCommand(() => document.dispatchEvent(new Event(OPEN_KEYBOARD_MAP)))
                  }
                >
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard shortcuts</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(handleQuickFocus)}>
                  <Zap className="mr-2 h-4 w-4 text-chart-3" />
                  <span>Start Focus Timer</span>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              {/*
                This palette is the admin's module switcher — v3 removed the
                sidebar rail, so every module has to be reachable from here.
                Driven from NAV_GROUPS rather than a hand-written subset, which
                previously listed only five of the sixteen.
              */}
              {NAV_GROUPS.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.href}
                      value={`${group.label} ${item.name}`}
                      onSelect={() => runCommand(() => router.push(item.href))}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              <CommandSeparator />
            </>
          )}

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/about"))}
            >
              <User className="mr-2 h-4 w-4" />
              <span>About</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/blog"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Blog</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => router.push("/work"))}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Projects</span>
            </CommandItem>
            {!isAdmin && (
              <CommandItem
                onSelect={() => runCommand(() => router.push("/admin/login"))}
              >
                <Terminal className="mr-2 h-4 w-4" />
                <span>Admin Login</span>
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            {/*
              These used to call setTheme("light" | "dark" | "system"). None of
              those are members of VALID_THEMES, so next-themes stripped the
              active `theme-*` class and replaced it with a class that defines
              no tokens — the site lost its palette until reload. "System" was
              doubly dead, since the provider runs `enableSystem={false}`.
              They now select the two real presets that carry the v2 identity.
            */}
            <CommandItem
              onSelect={() => runCommand(() => setTheme(LIGHT_THEME))}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme(DARK_THEME))}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(copyCurrentUrl)}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Current URL</span>
            </CommandItem>
            {isAdmin && (
              <CommandItem
                onSelect={() => runCommand(handleLogout)}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
