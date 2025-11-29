import { Event, EventStatus } from "@/types";

export function computeEventStatus(event: Event, now: Date = new Date()): EventStatus {
    if (event.isPostponed) {
        return "Postponed";
    }

    // Helper to parse date strings safely
    const parse = (d?: string) => (d ? new Date(d).getTime() : null);
    const nowTime = now.getTime();

    const regStart = parse(event.registrationStart);
    const regEnd = parse(event.registrationEnd);
    const evtStart = parse(event.eventStart);
    const evtEnd = parse(event.eventEnd);
    const reviewStart = parse(event.reviewStart);
    const reviewEnd = parse(event.reviewEnd);

    // 1. Upcoming: Now < Registration Start
    if (regStart && nowTime < regStart) {
        return "Upcoming";
    }

    // 2. OpenForRegistration: Registration Start <= Now <= Registration End
    if (regStart && regEnd && nowTime >= regStart && nowTime <= regEnd) {
        return "OpenForRegistration";
    }
    // If only regEnd is present and we are before it (and no regStart specified, assume open)
    if (!regStart && regEnd && nowTime <= regEnd) {
        return "OpenForRegistration";
    }

    // 3. RegistrationClosed: Now > Registration End AND Now < Event Start
    // (Only if event hasn't started yet)
    if (regEnd && evtStart && nowTime > regEnd && nowTime < evtStart) {
        return "RegistrationClosed";
    }

    // 4. Ongoing: Event Start <= Now <= Event End
    if (evtStart && evtEnd && nowTime >= evtStart && nowTime <= evtEnd) {
        return "Ongoing";
    }
    // If only evtStart is known and we are past it, and no end known? Assume ongoing?
    // Or if only evtEnd known and we are before it?
    // Let's stick to the rule: if we are in the event window.

    // 5. InReview: Now > Event End AND Now <= Review End
    if (evtEnd && reviewEnd && nowTime > evtEnd && nowTime <= reviewEnd) {
        // If reviewStart exists, check we are after it too?
        // "If now > eventEnd and reviewStart/reviewEnd exist and now <= reviewEnd"
        if (reviewStart) {
            if (nowTime >= reviewStart) return "InReview";
        } else {
            return "InReview";
        }
    }

    // 6. Completed: Now > Event End (and review phase passed or not relevant)
    if (evtEnd && nowTime > evtEnd) {
        // Check if we are past reviewEnd if it exists
        if (reviewEnd && nowTime > reviewEnd) {
            return "Completed";
        }
        if (!reviewEnd) {
            return "Completed";
        }
    }

    // Fallbacks for incomplete data
    if (evtStart && nowTime < evtStart) return "Upcoming";

    // Default fallback
    return "Upcoming";
}

export function formatDate(dateStr?: string, locale: string = "en"): string {
    if (!dateStr) return "";
    
    const date = new Date(dateStr);
    
    // 中文格式：12月18日
    if (locale === "zh") {
        return date.toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
        });
    }
    
    // 日语格式：12月18日
    if (locale === "ja") {
        return date.toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
        });
    }
    
    // 英文格式：Dec 18, 2025
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(dateStr?: string, locale: string = "en"): string {
    if (!dateStr) return "";
    
    const date = new Date(dateStr);
    
    // 中文格式：12月18日 下午5:00
    if (locale === "zh") {
        const formatted = date.toLocaleString("zh-CN", {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        // 确保格式为：12月18日 下午5:00
        return formatted.replace(/\s+/g, " ");
    }
    
    // 日语格式：12月18日 17:00
    if (locale === "ja") {
        return date.toLocaleString("ja-JP", {
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: false,
        });
    }
    
    // 英文格式：Dec 18, 2025, 5:00 PM
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}
