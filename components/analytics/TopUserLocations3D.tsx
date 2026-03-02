"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with WebGL
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// Dummy data: country usage statistics
const countryData = [
    { country: "IDN", name: "Indonesia", users: 1250, level: "high", lat: -2.5, lng: 118 },
    { country: "USA", name: "United States", users: 980, level: "high", lat: 37.09, lng: -95.71 },
    { country: "CHN", name: "China", users: 850, level: "high", lat: 35.86, lng: 104.19 },
    { country: "IND", name: "India", users: 720, level: "high", lat: 20.59, lng: 78.96 },
    { country: "SGP", name: "Singapore", users: 450, level: "medium", lat: 1.35, lng: 103.81 },
    { country: "MYS", name: "Malaysia", users: 420, level: "medium", lat: 4.21, lng: 101.97 },
    { country: "THA", name: "Thailand", users: 380, level: "medium", lat: 15.87, lng: 100.99 },
    { country: "VNM", name: "Vietnam", users: 340, level: "medium", lat: 14.05, lng: 108.27 },
    { country: "PHL", name: "Philippines", users: 310, level: "medium", lat: 12.87, lng: 121.77 },
    { country: "JPN", name: "Japan", users: 280, level: "low", lat: 36.20, lng: 138.25 },
    { country: "KOR", name: "South Korea", users: 250, level: "low", lat: 35.90, lng: 127.76 },
    { country: "AUS", name: "Australia", users: 220, level: "low", lat: -25.27, lng: 133.77 },
    { country: "GBR", name: "United Kingdom", users: 200, level: "low", lat: 55.37, lng: -3.43 },
    { country: "DEU", name: "Germany", users: 180, level: "low", lat: 51.16, lng: 10.45 },
    { country: "FRA", name: "France", users: 160, level: "low", lat: 46.22, lng: 2.21 },
    { country: "CAN", name: "Canada", users: 140, level: "low", lat: 56.13, lng: -106.34 },
    { country: "BRA", name: "Brazil", users: 120, level: "low", lat: -14.23, lng: -51.92 },
];

// Convert to format for globe
const polygonsData = countryData.map((d) => ({
    ...d,
    altitude: d.level === "high" ? 0.03 : d.level === "medium" ? 0.02 : 0.01,
    color:
        d.level === "high"
            ? "#5D4BEE" // Dark purple
            : d.level === "medium"
                ? "#9B8FF5" // Medium purple
                : "#D1CCFB", // Light purple
}));

export function TopUserLocations3D() {
    const globeEl = useRef<any>();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
        }
    }, []);

    if (!isClient) {
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
                <CardContent>
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        Loading 3D Globe...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-base font-semibold">
                        Top User Locations
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        View top user regions (3D Globe)
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    Month
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* 3D Globe */}
                <div className="w-full h-[300px] rounded-lg overflow-hidden">
                    <Globe
                        ref={globeEl}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                        labelsData={polygonsData}
                        labelLat={(d: any) => d.lat}
                        labelLng={(d: any) => d.lng}
                        labelText={(d: any) => `${d.name}: ${d.users.toLocaleString()} users`}
                        labelSize={0}
                        labelDotRadius={0.4}
                        labelColor={(d: any) => d.color}
                        labelResolution={2}
                        hexPolygonsData={polygonsData}
                        hexPolygonResolution={3}
                        hexPolygonMargin={0.3}
                        hexPolygonColor={(d: any) => d.color}
                        hexPolygonAltitude={(d: any) => d.altitude}
                        hexPolygonLabel={(d: any) => `
              <div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; color: white; font-size: 12px;">
                <strong>${d.name}</strong><br/>
                ${d.users.toLocaleString()} users
              </div>
            `}
                        atmosphereColor="#5D4BEE"
                        atmosphereAltitude={0.15}
                    />
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
