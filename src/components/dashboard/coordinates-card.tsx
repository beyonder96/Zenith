"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function CoordinatesCard() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCoords(newCoords);
          localStorage.setItem("zenith-vision-coords", JSON.stringify(newCoords));
          setIsLoading(false);
        },
        (err) => {
          setError(`Error: ${err.message}`);
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedCoords = localStorage.getItem("zenith-vision-coords");
    if (storedCoords) {
      try {
        setCoords(JSON.parse(storedCoords));
      } catch {
        // If stored data is corrupt, fetch new location
        getLocation();
      }
      setIsLoading(false);
    } else {
      getLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-headline flex items-center gap-2">
          <MapPin className="text-accent" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-4 text-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        )}
        {error && (
            <div className="text-destructive">
                <p>{error}</p>
                <Button onClick={getLocation} variant="outline" className="mt-4">Try Again</Button>
            </div>
        )}
        {!isLoading && coords && (
          <div>
            <p className="text-2xl font-semibold font-headline">Coordinates Acquired</p>
            <p className="text-muted-foreground">
              Lat: {coords.latitude.toFixed(4)}, Lon: {coords.longitude.toFixed(4)}
            </p>
          </div>
        )}
        {!isLoading && !coords && !error && (
             <Button onClick={getLocation}>Get Coordinates</Button>
        )}
      </CardContent>
    </Card>
  );
}
