import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Building2, Bed, Check, XCircle } from "lucide-react";

/**
 * Demo data — replace with your API data shape as needed
 */
const mockData: Building[] = [
    {
        id: "b1",
        name: "Main Hospital",
        floors: [
            {
                id: "f1",
                name: "Ground Floor",
                rooms: [
                    {
                        id: "r1",
                        name: "Room 101",
                        beds: [
                            { id: "bed1", label: "Bed 1", status: "available" },
                            { id: "bed2", label: "Bed 2", status: "occupied" },
                            { id: "bed3", label: "Bed 3", status: "cleaning" },
                        ],
                    },
                    {
                        id: "r2",
                        name: "Room 102",
                        beds: [
                            { id: "bed4", label: "Bed 1", status: "available" },
                            { id: "bed5", label: "Bed 2", status: "available" },
                        ],
                    },
                ],
            },
            {
                id: "f2",
                name: "1st Floor",
                rooms: [
                    {
                        id: "r3",
                        name: "ICU-1",
                        beds: [
                            { id: "bed6", label: "Bed A", status: "occupied" },
                            { id: "bed7", label: "Bed B", status: "available" },
                            { id: "bed8", label: "Bed C", status: "available" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: "b2",
        name: "Cancer Center",
        floors: [
            {
                id: "f3",
                name: "2nd Floor",
                rooms: [
                    {
                        id: "r4",
                        name: "Ward A",
                        beds: [
                            { id: "bed9", label: "Bed 1", status: "cleaning" },
                            { id: "bed10", label: "Bed 2", status: "available" },
                            { id: "bed11", label: "Bed 3", status: "occupied" },
                        ],
                    },
                ],
            },
        ],
    },
];

// Types
export type BedStatus = "available" | "occupied" | "cleaning";
export interface BedItem { id: string; label: string; status: BedStatus }
export interface Room { id: string; name: string; beds: BedItem[] }
export interface Floor { id: string; name: string; rooms: Room[] }
export interface Building { id: string; name: string; floors: Floor[] }

export interface SelectionValue {
    buildingId?: string | null;
    floorId?: string | null;
    roomId?: string | null;
    bedId?: string | null;
}

interface BedPickerProps {
    data?: Building[];
    value?: SelectionValue;
    onChange?: (v: SelectionValue) => void;
    disabledBeds?: BedStatus[]; // which statuses are not selectable
}

function statusBadgeVariant(status: BedStatus) {
    switch (status) {
        case "available":
            return "default";
        case "occupied":
            return "destructive";
        case "cleaning":
            return "secondary";
        default:
            return "outline";
    }
}

const Legend = () => (
    <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-foreground/80" /> Available
        </div>
        <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-destructive" /> Occupied
        </div>
        <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-muted-foreground" /> Cleaning
        </div>
    </div>
);

const BedGrid: React.FC<{
    beds: BedItem[];
    selectedId?: string | null;
    onSelect: (id: string) => void;
    disabledStatuses: BedStatus[];
}> = ({ beds, selectedId, onSelect, disabledStatuses }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {beds.map((b) => {
                const isDisabled = disabledStatuses.includes(b.status);
                const isSelected = selectedId === b.id;
                return (
                    <button
                        key={b.id}
                        type="button"
                        onClick={() => !isDisabled && onSelect(b.id)}
                        className={[
                            "group w-full rounded-2xl border text-left p-3 shadow-sm transition-all",
                            isDisabled
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md hover:-translate-y-0.5",
                            isSelected ? "ring-2 ring-foreground" : "",
                        ].join(" ")}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bed className="h-4 w-4" />
                                <span className="font-medium">{b.label}</span>
                            </div>
                            {isSelected ? (
                                <Check className="h-4 w-4" />
                            ) : isDisabled ? (
                                <XCircle className="h-4 w-4" />
                            ) : null}
                        </div>
                        <div className="mt-2">
                            <Badge variant={statusBadgeVariant(b.status)} className="capitalize">
                                {b.status}
                            </Badge>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

const BedPicker: React.FC<BedPickerProps> = ({
    data = mockData,
    value,
    onChange,
    disabledBeds = ["occupied", "cleaning"],
}) => {
    const [selection, setSelection] = React.useState<SelectionValue>({
        buildingId: value?.buildingId ?? null,
        floorId: value?.floorId ?? null,
        roomId: value?.roomId ?? null,
        bedId: value?.bedId ?? null,
    });

    React.useEffect(() => {
        onChange?.(selection);
    }, [selection]);

    // Resolve lists from selection
    const buildings = data;
    const building = buildings.find((b) => b.id === selection.buildingId) ?? null;
    const floors = building?.floors ?? [];
    const floor = floors.find((f) => f.id === selection.floorId) ?? null;
    const rooms = floor?.rooms ?? [];
    const room = rooms.find((r) => r.id === selection.roomId) ?? null;
    const beds = room?.beds ?? [];

    const resetFrom = (level: keyof SelectionValue) => {
        setSelection((prev) => {
            const next = { ...prev } as SelectionValue;
            if (level === "buildingId") {
                next.floorId = null;
                next.roomId = null;
                next.bedId = null;
            } else if (level === "floorId") {
                next.roomId = null;
                next.bedId = null;
            } else if (level === "roomId") {
                next.bedId = null;
            }
            return next;
        });
    };

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Select Bed
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Cascading selectors */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Building</label>
                        <Select
                            value={selection.buildingId ?? undefined}
                            onValueChange={(v: any) => {
                                setSelection((s) => ({ ...s, buildingId: v }));
                                resetFrom("buildingId");
                            }}
                        >
                            <SelectTrigger aria-label="Select Building">
                                <SelectValue placeholder="Choose building" />
                            </SelectTrigger>
                            <SelectContent>
                                {buildings.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Floor</label>
                        <Select
                            value={selection.floorId ?? undefined}
                            onValueChange={(v: any) => {
                                setSelection((s) => ({ ...s, floorId: v }));
                                resetFrom("floorId");
                            }}
                            disabled={!building}
                        >
                            <SelectTrigger aria-label="Select Floor">
                                <SelectValue placeholder="Choose floor" />
                            </SelectTrigger>
                            <SelectContent>
                                {floors.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Room/Ward</label>
                        <Select
                            value={selection.roomId ?? undefined}
                            onValueChange={(v: any) => {
                                setSelection((s) => ({ ...s, roomId: v }));
                                resetFrom("roomId");
                            }}
                            disabled={!floor}
                        >
                            <SelectTrigger aria-label="Select Room">
                                <SelectValue placeholder="Choose room" />
                            </SelectTrigger>
                            <SelectContent>
                                {rooms.map((r) => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bed</label>
                        <Select
                            value={selection.bedId ?? undefined}
                            onValueChange={(v: any) => setSelection((s) => ({ ...s, bedId: v }))}
                            disabled={!room}
                        >
                            <SelectTrigger aria-label="Select Bed">
                                <SelectValue placeholder="Choose bed" />
                            </SelectTrigger>
                            <SelectContent>
                                {beds.map((b) => (
                                    <SelectItem
                                        key={b.id}
                                        value={b.id}
                                        disabled={disabledBeds.includes(b.status)}
                                    >
                                        {b.label} — {b.status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Visual bed picker */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Quick pick</h4>
                        <Legend />
                    </div>
                    <div className="rounded-2xl border p-4">
                        {room ? (
                            <BedGrid
                                beds={beds}
                                selectedId={selection.bedId}
                                onSelect={(id) => setSelection((s) => ({ ...s, bedId: id }))}
                                disabledStatuses={disabledBeds}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Choose a building, floor and room to see beds.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selection.bedId ? (
                            <span>
                                Selected: <b>{selection.bedId}</b>
                            </span>
                        ) : (
                            <span>No bed selected</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                setSelection({ buildingId: null, floorId: null, roomId: null, bedId: null })
                            }
                        >
                            Clear
                        </Button>
                        <Button
                            disabled={!selection.bedId}
                            onClick={() => console.log("CONFIRM", selection)}
                        >
                            Confirm selection
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

/**
 * Page demo wrapper — export as default for Canvas preview
 */
export default function BuildingFloorRoomBedDemo() {
    const [picked, setPicked] = React.useState<SelectionValue>({});
    console.log("Selected values:", picked);
    return (
        <div className="p-6 min-h-screen bg-background">
            <div className="max-w-6xl mx-auto space-y-6">
                <BedPicker onChange={setPicked} />
                <Separator />
            </div>
        </div>
    );
}
