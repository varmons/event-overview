"use client";

import { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useEventStore } from "@/lib/store";
import { Event, EventType, Vendor, LocationType, OrganizerType } from "@/types";
import { computeEventStatus } from "@/lib/event-utils";
import { Upload, X, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { createEventRecord } from "@/lib/eventRepository";
import { uploadEventPoster } from "@/lib/storage";
import { verifySubmitPassword, SUBMIT_PASSWORD_STORAGE_KEY } from "@/lib/password";

export default function SubmitEventPage() {
    const router = useRouter();
    const { addEvent, refreshEvents } = useEventStore();
    const locale = useLocale();
    const t = useTranslations("submit");
    const tCommon = useTranslations("common");
    const tEventTypes = useTranslations("eventTypes");
    const tVendors = useTranslations("vendors");
    const tLocation = useTranslations("locationTypes");
    const tOrganizerTypes = useTranslations("organizerTypes");
    const eventTypeOptions: EventType[] = ["Meetup", "Hackathon", "Competition", "Workshop", "Webinar", "Other"];
    const vendorOptions: Vendor[] = ["Tencent", "Alibaba", "ByteDance", "Huawei Cloud", "Google", "Amazon", "Other"];
    const locationOptions: LocationType[] = ["Online", "Offline", "Hybrid"];
    const organizerOptions: OrganizerType[] = ["Individual", "Organization", "Community"];
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        eventType: "Meetup" as EventType,
        vendor: "Other" as Vendor | string,
        customVendor: "",
        tags: "",
        locationType: "Online" as LocationType,
        locationDetail: "",

        registrationStart: "",
        registrationEnd: "",
        eventStart: "",
        eventEnd: "",
        submissionDeadline: "",
        reviewStart: "",
        reviewEnd: "",
        announcementDate: "",
        demoDayDate: "",
        awardCeremonyDate: "",

        organizerName: "",
        organizerType: "Individual" as OrganizerType,
        organizerContact: "",

        registrationUrl: "",
        officialSiteUrl: "",
        livestreamUrl: "",
        recordingUrl: "",

        isPostponed: false,
        originalEventStart: "",
        originalEventEnd: "",
        postponedReason: "",
    });

    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isCheckingAccess, setIsCheckingAccess] = useState(true);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem(SUBMIT_PASSWORD_STORAGE_KEY);
        if (stored === "granted") {
            setIsAuthorized(true);
        }
        setIsCheckingAccess(false);
    }, []);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateAndSetFile = (file: File) => {
        const maxSize = 2 * 1024 * 1024; // 2MB limit
        if (file.size > maxSize) {
            setErrors((prev) => ({ ...prev, poster: t("validation.imageTooLarge") }));
            return false;
        }
        if (!file.type.startsWith("image/")) {
            setErrors((prev) => ({ ...prev, poster: t("validation.invalidImageType") }));
            return false;
        }

        setPosterFile(file);
        if (posterPreview) {
            URL.revokeObjectURL(posterPreview);
        }
        const objectUrl = URL.createObjectURL(file);
        setPosterPreview(objectUrl);
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.poster;
            return newErrors;
        });
        return true;
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!passwordInput.trim()) {
            setPasswordError(t("auth.required"));
            return;
        }

        setIsUnlocking(true);
        try {
            const isValid = await verifySubmitPassword(passwordInput);
            if (isValid) {
                setIsAuthorized(true);
                setPasswordError(null);
                if (typeof window !== "undefined") {
                    localStorage.setItem(SUBMIT_PASSWORD_STORAGE_KEY, "granted");
                }
                setPasswordInput("");
                return;
            }

            setPasswordError(t("auth.invalid"));
        } catch (error) {
            console.error("Failed to verify submit password", error);
            setPasswordError(t("auth.error"));
        } finally {
            setIsUnlocking(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) newErrors.title = t("validation.required");
        if (!formData.description.trim()) newErrors.description = t("validation.required");
        if (!formData.organizerName.trim()) newErrors.organizerName = t("validation.required");
        if (formData.vendor === "Other" && !formData.customVendor.trim()) {
            newErrors.customVendor = t("validation.required");
        }

        if (formData.locationType !== "Online" && !formData.locationDetail.trim()) {
            newErrors.locationDetail = t("validation.required");
        }

        if (!formData.eventStart) newErrors.eventStart = t("validation.required");
        if (!formData.eventEnd) newErrors.eventEnd = t("validation.required");

        const start = new Date(formData.eventStart).getTime();
        const end = new Date(formData.eventEnd).getTime();

        if (start && end && start > end) {
            newErrors.eventEnd = t("validation.endBeforeStart");
        }

        if (formData.registrationStart && formData.registrationEnd) {
            if (new Date(formData.registrationStart).getTime() > new Date(formData.registrationEnd).getTime()) {
                newErrors.registrationEnd = t("validation.regEndBeforeStart");
            }
        }

        if (formData.registrationEnd && start) {
            if (new Date(formData.registrationEnd).getTime() > start) {
                newErrors.registrationEnd = t("validation.regEndAfterEvent");
            }
        }

        if (formData.isPostponed) {
            if (!formData.originalEventStart) newErrors.originalEventStart = t("validation.postponedOriginalRequired");
            if (!formData.originalEventEnd) newErrors.originalEventEnd = t("validation.postponedOriginalRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toIsoString = (value?: string) => (value ? new Date(value).toISOString() : undefined);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            window.scrollTo(0, 0);
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            let finalRegEnd = formData.registrationEnd;
            if (formData.eventType === "Meetup" && !finalRegEnd && formData.eventStart) {
                const evtStart = new Date(formData.eventStart);
                evtStart.setDate(evtStart.getDate() - 1);
                evtStart.setHours(23, 59, 0, 0);
                finalRegEnd = evtStart.toISOString();
            }

            const tags = formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
            const vendorValue =
                formData.vendor === "Other" ? formData.customVendor.trim() : formData.vendor;
            const normalizedVendor = vendorValue || undefined;
            const eventId = crypto.randomUUID();
            const timestamp = new Date().toISOString();

            let posterUrl: string | undefined;
            if (posterFile) {
                posterUrl = await uploadEventPoster(posterFile, eventId);
            }

            const normalizedDates = {
                registrationStart: toIsoString(formData.registrationStart),
                registrationEnd: toIsoString(finalRegEnd),
                eventStart: toIsoString(formData.eventStart)!,
                eventEnd: toIsoString(formData.eventEnd)!,
                submissionDeadline: toIsoString(formData.submissionDeadline),
                reviewStart: toIsoString(formData.reviewStart),
                reviewEnd: toIsoString(formData.reviewEnd),
                announcementDate: toIsoString(formData.announcementDate),
                demoDayDate: toIsoString(formData.demoDayDate),
                awardCeremonyDate: toIsoString(formData.awardCeremonyDate),
                originalEventStart: toIsoString(formData.originalEventStart),
                originalEventEnd: toIsoString(formData.originalEventEnd),
            };

            const newEvent: Event = {
                id: eventId,
                title: formData.title,
                subtitle: formData.subtitle || undefined,
                description: formData.description,
                eventType: formData.eventType,
                vendor: normalizedVendor,
                tags,
                locationType: formData.locationType,
                locationDetail: formData.locationType === "Online"
                    ? undefined
                    : formData.locationDetail || undefined,
                posterUrl,
                registrationStart: normalizedDates.registrationStart,
                registrationEnd: normalizedDates.registrationEnd,
                eventStart: normalizedDates.eventStart,
                eventEnd: normalizedDates.eventEnd,
                submissionDeadline: normalizedDates.submissionDeadline,
                reviewStart: normalizedDates.reviewStart,
                reviewEnd: normalizedDates.reviewEnd,
                announcementDate: normalizedDates.announcementDate,
                demoDayDate: normalizedDates.demoDayDate,
                awardCeremonyDate: normalizedDates.awardCeremonyDate,
                status: "Upcoming",
                isPostponed: formData.isPostponed,
                originalEventStart: normalizedDates.originalEventStart,
                originalEventEnd: normalizedDates.originalEventEnd,
                postponedReason: formData.postponedReason || undefined,
                organizerName: formData.organizerName,
                organizerType: formData.organizerType,
                organizerContact: formData.organizerContact || undefined,
                organizerAvatarUrl: undefined,
                registrationUrl: formData.registrationUrl || undefined,
                officialSiteUrl: formData.officialSiteUrl || undefined,
                livestreamUrl: formData.livestreamUrl || undefined,
                recordingUrl: formData.recordingUrl || undefined,
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            newEvent.status = computeEventStatus(newEvent);

            const createdEvent = await createEventRecord(newEvent);

            addEvent(createdEvent);
            await refreshEvents();

            router.push(`/${locale}/events/${createdEvent.id}`);
        } catch (error) {
            console.error("Failed to submit event", error);
            const message = error instanceof Error ? error.message : "Failed to submit event";
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-600">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                    <p className="text-sm">{t("auth.loading")}</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <Lock className="w-6 h-6 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">{t("auth.title")}</h1>
                            <p className="text-sm text-gray-500 mt-1">{t("auth.description")}</p>
                        </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("auth.passwordLabel")}
                            </label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => {
                                    setPasswordInput(e.target.value);
                                    if (passwordError) setPasswordError(null);
                                }}
                                placeholder={t("auth.placeholder")}
                                className={cn(
                                    "w-full rounded-md border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                    passwordError ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                )}
                            />
                            {passwordError && <p className="text-sm text-red-600 mt-2">{passwordError}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={isUnlocking}
                            className="w-full rounded-md bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isUnlocking ? t("auth.unlocking") : t("auth.submitButton")}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
                        <p className="text-gray-500 mt-1">
                            {t("description")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-900">
                                        {t("validation.formErrors")}
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                        {Object.values(errors).map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-red-900">{t("errorTitle")}</h4>
                                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
                                </div>
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("basicInfo")}
                            </h3>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.title.label")} <span className="text-red-500">{tCommon("required")}</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.title ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                        placeholder={t("fields.title.placeholder")}
                                    />
                                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.subtitle.label")}
                                    </label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.subtitle.placeholder")}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.description.label")} <span className="text-red-500">{tCommon("required")}</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={5}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.description ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                        placeholder={t("fields.description.placeholder")}
                                    />
                                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("fields.eventType.label")}
                                        </label>
                                        <select
                                            name="eventType"
                                            value={formData.eventType}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {eventTypeOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {tEventTypes(opt)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("fields.vendor.label")}
                                        </label>
                                        <select
                                            name="vendor"
                                            value={formData.vendor}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            {vendorOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {tVendors(opt)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formData.vendor === "Other" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t("fields.customVendor.label")}
                                        </label>
                                        <input
                                            type="text"
                                            name="customVendor"
                                            value={formData.customVendor}
                                            onChange={handleChange}
                                            className={cn(
                                                "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none",
                                                errors.customVendor ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                            )}
                                            placeholder={t("fields.customVendor.placeholder")}
                                        />
                                        {errors.customVendor && (
                                            <p className="text-xs text-red-500 mt-1">{errors.customVendor}</p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.tags.label")}
                                    </label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.tags.placeholder")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("location")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.locationType.label")}
                                    </label>
                                    <select
                                        name="locationType"
                                        value={formData.locationType}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {locationOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {tLocation(opt)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.locationDetail.label")}{" "}
                                        {formData.locationType !== "Online" && <span className="text-red-500">{tCommon("required")}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="locationDetail"
                                        value={formData.locationDetail}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.locationDetail ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                        placeholder={t("fields.locationDetail.placeholder")}
                                    />
                                    {errors.locationDetail && <p className="text-xs text-red-500 mt-1">{errors.locationDetail}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("dates")}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.eventStart.label")} <span className="text-red-500">{tCommon("required")}</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventStart"
                                        value={formData.eventStart}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.eventStart ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                    />
                                    {errors.eventStart && <p className="text-xs text-red-500 mt-1">{errors.eventStart}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.eventEnd.label")} <span className="text-red-500">{tCommon("required")}</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventEnd"
                                        value={formData.eventEnd}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.eventEnd ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                    />
                                    {errors.eventEnd && <p className="text-xs text-red-500 mt-1">{errors.eventEnd}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.registrationStart.label")}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="registrationStart"
                                        value={formData.registrationStart}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.registrationEnd.label")}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="registrationEnd"
                                        value={formData.registrationEnd}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.registrationEnd ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                    />
                                    {formData.eventType === "Meetup" && !formData.registrationEnd && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {t("validation.meetupAutoRegEnd")}
                                        </p>
                                    )}
                                    {errors.registrationEnd && <p className="text-xs text-red-500 mt-1">{errors.registrationEnd}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Organizer */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("organizer")}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.organizerName.label")} <span className="text-red-500">{tCommon("required")}</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="organizerName"
                                        value={formData.organizerName}
                                        onChange={handleChange}
                                        className={cn(
                                            "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                            errors.organizerName ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                        )}
                                    />
                                    {errors.organizerName && <p className="text-xs text-red-500 mt-1">{errors.organizerName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.organizerType.label")}
                                    </label>
                                    <select
                                        name="organizerType"
                                        value={formData.organizerType}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {organizerOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {tOrganizerTypes(opt)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.organizerContact.label")}
                                    </label>
                                    <input
                                        type="text"
                                        name="organizerContact"
                                        value={formData.organizerContact}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.organizerContact.placeholder")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Links */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("links")}
                            </h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.registrationUrl.label")}
                                    </label>
                                    <input
                                        type="url"
                                        name="registrationUrl"
                                        value={formData.registrationUrl}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.registrationUrl.placeholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.officialSiteUrl.label")}
                                    </label>
                                    <input
                                        type="url"
                                        name="officialSiteUrl"
                                        value={formData.officialSiteUrl}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.officialSiteUrl.placeholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.livestreamUrl.label")}
                                    </label>
                                    <input
                                        type="url"
                                        name="livestreamUrl"
                                        value={formData.livestreamUrl}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.livestreamUrl.placeholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.recordingUrl.label")}
                                    </label>
                                    <input
                                        type="url"
                                        name="recordingUrl"
                                        value={formData.recordingUrl}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t("fields.recordingUrl.placeholder")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Poster Upload */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                {t("fields.poster.label")}
                            </h3>
                            <div className="flex items-start gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t("fields.poster.label")}
                                    </label>
                                    <div
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors cursor-pointer"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById("file-upload")?.click()}
                                    >
                                        <div className="space-y-2 text-center pointer-events-none">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="text-sm">
                                                <span className="font-medium text-blue-600">
                                                    {t("fields.poster.button")}
                                                </span>
                                                <span className="text-gray-500"> {t("fields.poster.dragDrop")}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {t("fields.poster.requirements")}
                                            </p>
                                        </div>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {errors.poster && <p className="text-xs text-red-500 mt-1">{errors.poster}</p>}
                                </div>
                                {posterPreview && (
                                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                                        <img
                                            src={posterPreview}
                                            alt={t("fields.poster.label")}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (posterPreview) {
                                                    URL.revokeObjectURL(posterPreview);
                                                }
                                                setPosterFile(null);
                                                setPosterPreview(null);
                                            }}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Postponed Toggle */}
                        <div className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPostponed"
                                        name="isPostponed"
                                        checked={formData.isPostponed}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPostponed" className="text-sm font-medium text-gray-900">
                                        {t("fields.isPostponed.label")}
                                    </label>
                                </div>
                            </div>

                            {formData.isPostponed && (
                                <div className="space-y-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        {t("postponedInfo")}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("fields.originalEventStart.label")} <span className="text-red-500">{tCommon("required")}</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="originalEventStart"
                                                value={formData.originalEventStart}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                                    errors.originalEventStart ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("fields.originalEventEnd.label")} <span className="text-red-500">{tCommon("required")}</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                name="originalEventEnd"
                                                value={formData.originalEventEnd}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all",
                                                    errors.originalEventEnd ? "border-red-300 focus:ring-red-200" : "border-gray-300"
                                                )}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t("fields.postponedReason.label")}
                                            </label>
                                            <input
                                                type="text"
                                                name="postponedReason"
                                                value={formData.postponedReason}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder={t("fields.postponedReason.placeholder")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? t("submitting") : t("submit")}
                                {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
