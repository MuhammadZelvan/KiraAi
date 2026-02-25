"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from "react-simple-maps";
import { useState } from "react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Dummy data: country usage statistics
const countryData = [
    { id: "IDN", name: "Indonesia", users: 1250, level: "high" },
    { id: "USA", name: "United States", users: 980, level: "high" },
    { id: "CHN", name: "China", users: 850, level: "high" },
    { id: "IND", name: "India", users: 720, level: "high" },
    { id: "SGP", name: "Singapore", users: 450, level: "medium" },
    { id: "MYS", name: "Malaysia", users: 420, level: "medium" },
    { id: "THA", name: "Thailand", users: 380, level: "medium" },
    { id: "VNM", name: "Vietnam", users: 340, level: "medium" },
    { id: "PHL", name: "Philippines", users: 310, level: "medium" },
    { id: "JPN", name: "Japan", users: 280, level: "low" },
    { id: "KOR", name: "South Korea", users: 250, level: "low" },
    { id: "AUS", name: "Australia", users: 220, level: "low" },
    { id: "GBR", name: "United Kingdom", users: 200, level: "low" },
    { id: "DEU", name: "Germany", users: 180, level: "low" },
    { id: "FRA", name: "France", users: 160, level: "low" },
    { id: "CAN", name: "Canada", users: 140, level: "low" },
    { id: "BRA", name: "Brazil", users: 120, level: "low" },
];

// Create a map for quick lookup
const countryMap = new Map(countryData.map((c) => [c.id, c]));

export function TopUserLocations() {
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [tooltipContent, setTooltipContent] = useState("");

    const getCountryColor = (geo: any) => {
        const countryId = geo.id;
        const country = countryMap.get(countryId);

        if (!country) {
            return "#E5E7EB"; // Gray for countries with no data
        }

        // Color based on usage level
        switch (country.level) {
            case "high":
                return "#5D4BEE"; // Dark purple (primary)
            case "medium":
                return "#9B8FF5"; // Medium purple
            case "low":
                return "#D1CCFB"; // Light purple
            default:
                return "#E5E7EB"; // Gray
        }
    };

    return (
        <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Top User Locations
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        View top user regions
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    Month
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* World Map */}
                <div className="relative w-full" style={{ height: "300px" }}>
                    <ComposableMap
                        projectionConfig={{
                            scale: 200,
                            center: [100, 10],
                        }}
                        className="w-full h-full"
                    >
                        <ZoomableGroup center={[100, 10]} zoom={1.5}>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const country = countryMap.get(geo.id);
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={getCountryColor(geo)}
                                                stroke="#FFFFFF"
                                                strokeWidth={0.5}
                                                onMouseEnter={() => {
                                                    if (country) {
                                                        setHoveredCountry(geo.id);
                                                        setTooltipContent(
                                                            `${country.name}: ${country.users.toLocaleString()} users`
                                                        );
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredCountry(null);
                                                    setTooltipContent("");
                                                }}
                                                style={{
                                                    default: {
                                                        outline: "none",
                                                    },
                                                    hover: {
                                                        fill: country ? "#4338CA" : "#E5E7EB",
                                                        outline: "none",
                                                        cursor: country ? "pointer" : "default",
                                                    },
                                                    pressed: {
                                                        outline: "none",
                                                    },
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    {/* Tooltip */}
                    {tooltipContent && (
                        <div className="absolute top-2 left-2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
                            {tooltipContent}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-[#5D4BEE]" />
                        <span className="text-sm text-muted-foreground">High Usage</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-[#D1CCFB]" />
                        <span className="text-sm text-muted-foreground">Low Usage</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
