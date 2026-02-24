"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";
import { buttonVariants } from "./button";
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
    return (<DayPicker showOutsideDays={showOutsideDays} className={cn("p-3 relative", className)} classNames={{
            months: "flex flex-col sm:flex-row gap-2 relative",
            month: "flex flex-col gap-4",
            month_caption: "flex justify-center pt-2 relative items-center w-full mb-2",
            caption_label: "text-sm font-medium",
            nav: "absolute right-2 top-4 flex items-center gap-1 z-10",
            nav_button: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
            nav_button_previous: "",
            nav_button_next: "",
            month_grid: "w-full border-collapse space-y-1",
            weekdays: "flex w-full justify-between mt-2",
            weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            week: "flex w-full justify-between mt-2",
            day: "h-9 w-9 text-center text-sm p-0 relative",
            day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal transition-none hover:bg-[#F0E0CD] hover:text-[#402E24]"),
            range_start: "day-range-start bg-[#402E24] text-white hover:bg-[#402E24] hover:text-white rounded-l-md",
            range_end: "day-range-end bg-[#402E24] text-white hover:bg-[#402E24] hover:text-white rounded-r-md",
            selected: "bg-[#402E24] text-white hover:bg-[#402E24] hover:text-white focus:bg-[#402E24] focus:text-white rounded-md",
            today: "bg-gray-100 text-gray-900 rounded-md",
            outside: "text-muted-foreground opacity-50",
            disabled: "text-muted-foreground opacity-50",
            range_middle: "aria-selected:bg-[#F0E0CD] aria-selected:text-[#402E24] rounded-none !bg-[#F0E0CD] !text-[#402E24]",
            hidden: "invisible",
            ...classNames,
        }} components={{
            IconLeft: ({ className, ...props }) => (<ChevronLeft className={cn("size-4", className)} {...props}/>),
            IconRight: ({ className, ...props }) => (<ChevronRight className={cn("size-4", className)} {...props}/>),
        }} {...props}/>);
}
export { Calendar };
