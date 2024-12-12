interface ToggleProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    label: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="flex items-center justify-between w-full p-4 rounded-lg"
        >
            <span className="text-lg">{label}</span>
            <div
                className={`!relative !inline-flex !h-6 !w-11 !items-center !rounded-full !transition-colors
                    ${enabled ? '!bg-[#183715]' : '!bg-[#183715]/30 hover:!bg-[#183715]/40'}`}
            >
                <span
                    className={`!inline-block !h-4 !w-4 !transform !rounded-full !bg-white !transition-transform
                        ${enabled ? '!-translate-x-6' : '!-translate-x-1'}`}
                />
            </div>
        </button>
    );
}