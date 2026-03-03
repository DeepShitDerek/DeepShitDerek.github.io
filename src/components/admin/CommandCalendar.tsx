"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Loader2,
  Calendar as CalendarIcon,
  Plus,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import { getNextOccurrence, getFirstOccurrence } from "@/lib/finance-utils";
import {
  useGetCalendarDataQuery,
  useAddEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
} from "@/store/api/adminApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/components/providers/ConfirmDialogProvider";
import { PageHeader, ManagerWrapper } from "./shared";

// Extracted components
import {
  mapItemToEvent,
  getDaysInMonth,
  getEventsForDate,
  EventBadge,
  CalendarFilters,
  EventFormSheet,
  ResponsiveDayEvents,
  ResponsiveEventDetails,
  type EventType,
  type EventFormData,
  type SheetState,
  type ViewEventState,
  type DayListState,
} from "./calendar";

export default function CommandCalendar({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) {
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [filters, setFilters] = useState<string[]>([
    "event",
    "task",
    "transaction_summary",
    "forecast",
    "habit_summary",
  ]);

  const { data, isLoading, error } = useGetCalendarDataQuery(
    dateRange ?? skipToken
  );
  const [addEvent] = useAddEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();

  const [sheetState, setSheetState] = useState<SheetState>({
    open: false,
    isNew: false,
  });
  const [viewEventState, setViewEventState] = useState<ViewEventState>({
    open: false,
    event: null,
  });
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    id: "",
    title: "",
    description: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    is_all_day: false,
  });
  const [dayListState, setDayListState] = useState<DayListState>({
    open: false,
    date: null,
    events: [],
  });

  useEffect(() => {
    if (error)
      toast.error("Failed to load calendar data", {
        description: (error as any).message,
      });
  }, [error]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    setDateRange({
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }, [currentDate]);

  // Enhanced forecasting logic
  const events = useMemo(() => {
    if (!data) return [];

    const baseEvents = data.baseEvents.map(mapItemToEvent);
    const forecastEvents: EventType[] = [];

    const today = startOfDay(new Date());
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const viewStart = startOfDay(new Date(year, month - 1, 1));
    const viewEnd = endOfDay(new Date(year, month + 2, 0));

    data.recurring?.forEach((rule) => {
      // ── Determine the first occurrence to iterate from ────────────
      // If we've already processed some occurrences, start from the
      // next one strictly after last_processed_date.
      // If we haven't processed any, compute the FIRST valid occurrence
      // from start_date (respecting occurrence_day so we don't show
      // a phantom entry on start_date when it's the wrong weekday/day).
      let cursor: Date;

      if (rule.last_processed_date) {
        cursor = getNextOccurrence(
          parseLocalDate(rule.last_processed_date),
          rule
        );
      } else {
        cursor = getFirstOccurrence(parseLocalDate(rule.start_date), rule);
      }

      const ruleEndDate = rule.end_date
        ? parseLocalDate(rule.end_date)
        : null;

      let safety = 0;

      while (isBefore(cursor, viewEnd) && safety < 1000) {
        // Respect end_date
        if (ruleEndDate && isAfter(cursor, ruleEndDate)) break;

        // Only show forecast items for today or future within the view window
        if (
          (isAfter(cursor, today) || isSameDay(cursor, today)) &&
          isAfter(cursor, viewStart)
        ) {
          forecastEvents.push({
            id: `forecast-${rule.id}-${cursor.getTime()}`,
            title: rule.description,
            start: new Date(cursor),
            allDay: true,
            type: "forecast",
            amount: rule.amount,
            transactionType: rule.type,
          });
        }

        cursor = getNextOccurrence(cursor, rule);
        safety++;
      }
    });

    return [...baseEvents, ...forecastEvents].filter((event) =>
      filters.includes(event.type)
    );
  }, [data, filters, currentDate]);

  const navigateMonth = (direction: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1
      )
    );
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave: any = {
      title: eventFormData.title,
      description: eventFormData.description || null,
      start_time: eventFormData.start_time,
      end_time: eventFormData.end_time || null,
      is_all_day: eventFormData.is_all_day,
    };

    if (eventFormData.id && eventFormData.id.trim() !== "") {
      dataToSave.id = eventFormData.id;
    }

    try {
      if (sheetState.isNew) {
        await addEvent(dataToSave).unwrap();
      } else {
        await updateEvent(dataToSave).unwrap();
      }
      toast.success(
        `Event ${sheetState.isNew ? "created" : "updated"} successfully.`
      );
      setSheetState({ open: false, isNew: false });
    } catch (err: any) {
      toast.error("Failed to save event", { description: err.message });
    }
  };

  const handleDeleteEvent = async (id?: string) => {
    const targetId = id || eventFormData.id;
    if (!targetId) return;

    const isConfirmed = await confirm({
      title: "Delete Event?",
      description: "Are you sure you want to delete this event?",
      variant: "destructive",
      confirmText: "Delete",
    });

    if (!isConfirmed) return;

    try {
      await deleteEvent(targetId).unwrap();
      toast.success("Event deleted.");
      setSheetState({ open: false, isNew: false });
      setViewEventState({ open: false, event: null });
    } catch (err: any) {
      toast.error("Failed to delete event", { description: err.message });
    }
  };

  const handleEditClick = () => {
    const eventToEdit = viewEventState.event;
    if (!eventToEdit) return;

    setEventFormData({
      id: eventToEdit.id,
      title: eventToEdit.title,
      description: eventToEdit.description || "",
      start_time: eventToEdit.start.toISOString(),
      end_time:
        eventToEdit.end?.toISOString() || eventToEdit.start.toISOString(),
      is_all_day: eventToEdit.allDay,
    });
    setViewEventState({ open: false, event: null });
    setSheetState({ open: true, isNew: false });
  };

  const handleAddNewEvent = () => {
    setEventFormData({
      id: "",
      title: "",
      description: "",
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      is_all_day: false,
    });
    setSheetState({ open: true, isNew: true });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <ManagerWrapper className="flex flex-col">
      <PageHeader
        title="Command Calendar"
        description="Your centralized timeline for money, tasks, and habits"
        filters={<CalendarFilters filters={filters} onFiltersChange={setFilters} />}
        actions={
          <Button size="sm" className="shadow-md" onClick={handleAddNewEvent}>
            <Plus className="size-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Event</span>
          </Button>
        }
      />

      {/* CALENDAR CONTAINER */}
      <div className="relative flex-1 min-h-0 border rounded-xl bg-card/40 shadow-sm overflow-hidden backdrop-blur-sm">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="size-10 animate-spin text-primary" />
          </div>
        )}

        <div className="h-full flex flex-col">
          {/* Calendar Header */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg md:text-xl font-bold">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <ScrollArea className="flex-1">
            <div className="p-2 md:p-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2"
                    >
                      {isMobile ? day.charAt(0) : day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(events, day.date);
                  const isToday =
                    day.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[80px] md:min-h-[120px] p-1 md:p-2 rounded-lg border transition-all",
                        day.isCurrentMonth
                          ? "bg-card border-border"
                          : "bg-muted/30 border-border/50 opacity-50",
                        isToday && "ring-2 ring-primary"
                      )}
                    >
                      <div
                        className={cn(
                          "text-xs md:text-sm font-semibold mb-1",
                          isToday
                            ? "bg-primary text-primary-foreground w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center"
                            : "text-foreground"
                        )}
                      >
                        {day.date.getDate()}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => (
                          <EventBadge
                            key={event.id}
                            event={event}
                            onViewEvent={setViewEventState}
                          />
                        ))}
                        {dayEvents.length > (isMobile ? 2 : 3) && (
                          <button
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                            onClick={() => {
                              setDayListState({
                                open: true,
                                date: day.date,
                                events: dayEvents,
                              });
                            }}
                          >
                            +{dayEvents.length - (isMobile ? 2 : 3)} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Event Details - Responsive (Drawer on mobile, Sheet on desktop) */}
      <ResponsiveEventDetails
        state={viewEventState}
        onClose={() => setViewEventState({ open: false, event: null })}
        onEdit={handleEditClick}
        onDelete={() => handleDeleteEvent(viewEventState.event?.id)}
        onNavigate={onNavigate}
      />

      {/* Create/Edit Event Sheet */}
      <EventFormSheet
        sheetState={sheetState}
        formData={eventFormData}
        onFormDataChange={setEventFormData}
        onClose={() => setSheetState({ ...sheetState, open: false })}
        onSubmit={handleEventFormSubmit}
        onDelete={() => handleDeleteEvent()}
      />

      {/* Day Events List - Responsive (Drawer on mobile, Sheet on desktop) */}
      <ResponsiveDayEvents
        state={dayListState}
        onClose={() => setDayListState({ ...dayListState, open: false })}
        onViewEvent={setViewEventState}
      />
    </ManagerWrapper>
  );
}