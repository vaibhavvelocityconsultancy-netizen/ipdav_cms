"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchers } from "@/src/lib/fetchers";
import { Button } from "@/src/ui/button";
import SiteNavbar from "@/src/components/site/siteNavbar";
import { useCurrentUser } from "@/src/hooks/use-current-user";
import { apiMutations } from "@/src/lib/apimutation";

const DEFAULT_CONFIG = {
    bgColor: "#0B0F1A",
    bgOpacity: 90,
    linkColor: "#cbd5e1",
    linkHoverColor: "#ffffff",
    accentColor: "#22d3ee",
    dropdownBg: "#111827",
    sticky: true,
    blur: true,
    showLogin: true,
    showSignup: true,
    showPricing: true,
    loginLabel: "Log In",
    signupLabel: "Sign Up",
    pricingLabel: "Pricing",
    customCss: "",
};

// PLACEHOLDER — will correct once SiteFooter.tsx is shared
const DEFAULT_FOOTER_CONFIG = {
  bgColor: "#0B0F1A",
  textColor: "#94a3b8",
  linkColor: "#cbd5e1",
  linkHoverColor: "#ffffff",
  accentColor: "#22d3ee",
  borderColor: "#ffffff0d",
  customCss: "",
};


export default function NavbarConfigEditor() {
    const queryClient = useQueryClient();

    // ── navbar config ──
    const { data, isLoading } = useQuery({
        queryKey: ["navbar-config"],
        queryFn: fetchers.getNavbarConfig,
        staleTime: 0,
    });

    // ── real menus (same source SiteLayout/SiteNavbar actually use) ──
    const { data: menusData, isLoading: menusLoading } = useQuery({
        queryKey: ["menus"],
        queryFn: fetchers.menus,
        staleTime: 60_000,
    });

    // ── real site settings (for logo/siteName in preview) ──
    const { data: settingsData } = useQuery({
        queryKey: ["settings"],
        queryFn: fetchers.settings,
        staleTime: 60_000,
    });

    const headerMenu = useMemo(() => {
        const menus = menusData?.data ?? [];
        return menus.find((m: any) => m.location === "header") ?? null;
    }, [menusData]);

    const previewSettings = settingsData?.data ?? { siteName: "Your Site", logo: "" };

    const [draft, setDraft] = useState<any>(null);

    const config = useMemo(() => {
        if (draft) return draft;
        return data?.data ?? DEFAULT_CONFIG;
    }, [draft, data]);

    const update = (patch: Partial<typeof DEFAULT_CONFIG>) => {
        setDraft({ ...config, ...patch });
    };

    const { mutate: save, isPending: isSaving } = useMutation({
        mutationFn: (payload: any) => apiMutations.updateNavbarConfig(payload),
        onSuccess: (res) => {
            queryClient.setQueryData(["navbar-config"], res);
            setDraft(null);
        },
    });

    const { mutate: reset, isPending: isResetting } = useMutation({
        mutationFn: () => apiMutations.resetNavbarConfig(),
        onSuccess: (res) => {
            queryClient.setQueryData(["navbar-config"], res);
            setDraft(null);
        },
    });

    if (isLoading || menusLoading) {
        return <div className="p-6 text-gray-400">Loading navbar settings…</div>;
    }


    return (
        <div className="flex flex-col gap-6">
            {/* ── LEFT: Controls ── */}
            <div className="space-y-6">
                <Section title="Colors">
                    <ColorField label="Background" value={config.bgColor} onChange={(v) => update({ bgColor: v })} />
                    <RangeField label="Background Opacity" value={config.bgOpacity} onChange={(v) => update({ bgOpacity: v })} />
                    <ColorField label="Link Color" value={config.linkColor} onChange={(v) => update({ linkColor: v })} />
                    <ColorField label="Link Hover Color" value={config.linkHoverColor} onChange={(v) => update({ linkHoverColor: v })} />
                    <ColorField label="Accent (CTA buttons)" value={config.accentColor} onChange={(v) => update({ accentColor: v })} />
                    <ColorField label="Dropdown Background" value={config.dropdownBg} onChange={(v) => update({ dropdownBg: v })} />
                </Section>

                <Section title="Behavior">
                    <ToggleField label="Sticky Header" value={config.sticky} onChange={(v) => update({ sticky: v })} />
                    <ToggleField label="Background Blur" value={config.blur} onChange={(v) => update({ blur: v })} />
                </Section>

                <Section title="Buttons">
                    <ToggleWithLabel
                        label="Login Button"
                        checked={config.showLogin}
                        onCheckedChange={(v: boolean) => update({ showLogin: v })}
                        text={config.loginLabel}
                        onTextChange={(v: string) => update({ loginLabel: v })}
                    />
                    <ToggleWithLabel
                        label="Signup Button"
                        checked={config.showSignup}
                        onCheckedChange={(v: boolean) => update({ showSignup: v })}
                        text={config.signupLabel}
                        onTextChange={(v: string) => update({ signupLabel: v })}
                    />
                    <ToggleWithLabel
                        label="Pricing Button"
                        checked={config.showPricing}
                        onCheckedChange={(v: boolean) => update({ showPricing: v })}
                        text={config.pricingLabel}
                        onTextChange={(v: string) => update({ pricingLabel: v })}
                    />
                </Section>

                <Section title="Advanced CSS" subtitle="Applies only within the navbar (#site-navbar). Use with care.">
                    <textarea
                        className="w-full h-40 font-mono text-sm rounded-md border border-gray-300 p-3 bg-gray-950 text-gray-100"
                        placeholder={`.your-class {\n  /* your CSS here */\n}`}
                        value={config.customCss}
                        onChange={(e) => update({ customCss: e.target.value })}
                        spellCheck={false}
                    />
                </Section>

                <div className="flex items-center gap-3 pt-2">
                    <Button onClick={() => save(config)} disabled={isSaving}>
                        {isSaving ? "Saving…" : "Save Changes"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (confirm("Reset navbar to default settings? This can't be undone.")) reset();
                        }}
                        disabled={isResetting}
                    >
                        {isResetting ? "Resetting…" : "Reset to Default"}
                    </Button>
                    {draft && (
                        <span className="text-xs text-amber-500">Unsaved changes — preview only</span>
                    )}
                </div>
            </div>

            {/* ── RIGHT: Live Preview ── */}
            <div className="rounded-xl border border-gray-800 overflow-hidden sticky top-6 h-fit">
                <div className="bg-gray-900 text-xs text-gray-400 px-3 py-2 border-b border-gray-800">
                    Live Preview
                </div>
                <div className="relative">
                    <SiteNavbar settings={previewSettings} headerMenu={headerMenu} config={config} />
                </div>
            </div>
        </div>
    );
}

// ── small field primitives ──

function Section({ title, subtitle, children }: any) {
    return (
        <div className="rounded-lg border border-gray-800 p-4 space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {children}
        </div>
    );
}

function ColorField({ label, value, onChange }: any) {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="text-sm text-gray-400">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-8 w-8 rounded border border-gray-700 bg-transparent cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-24 text-xs font-mono rounded border border-gray-700 bg-gray-900 text-gray-200 px-2 py-1"
                />
            </div>
        </div>
    );
}

function RangeField({ label, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{label}</label>
                <span className="text-xs text-gray-500">{value}%</span>
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full"
            />
        </div>
    );
}

function ToggleField({ label, value, onChange }: any) {
    return (
        <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">{label}</label>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4"
            />
        </div>
    );
}

function ToggleWithLabel({ label, checked, onCheckedChange, text, onTextChange }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{label}</label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                    className="h-4 w-4"
                />
            </div>
            {checked && (
                <input
                    type="text"
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="w-full text-sm rounded border border-gray-700 bg-gray-900 text-gray-200 px-2 py-1"
                />
            )}
        </div>
    );
}