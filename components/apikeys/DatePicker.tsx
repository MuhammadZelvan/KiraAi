"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo() {
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [mounted, setMounted] = React.useState(false);

    // Set date only on client-side to avoid hydration mismatch
    React.useEffect(() => {
        setDate(new Date());
        setMounted(true);
    }, []);

    // Don't render date until mounted to avoid hydration error
    if (!mounted) {
        return (
            <Button
                variant={"outline"}
                className="gap-2 justify-start text-left font-normal text-muted-foreground"
            >
                <CalendarIcon className="h-4 w-4" />
                <span>Calendar</span>
            </Button>
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "gap-2 justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
