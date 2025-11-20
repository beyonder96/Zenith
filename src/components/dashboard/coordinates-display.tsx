
"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CoordinatesDisplay() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This function will run only on the client side
    const getLocation = () => {
      const storedCoords = localStorage.getItem("zenith-vision-coords");
      if (storedCoords) {
        try {
          setCoords(JSON.parse(storedCoords));
          setIsLoading(false);
          return; // Exit if we have stored coords
        } catch {
          // If parsing fails, proceed to get new location
        }
      }
      
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
        setError("Geolocation is not supported.");
        setIsLoading(false);
      }
    };
    
    getLocation();

  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="text-muted-foreground mt-2 text-sm h-4">
      {isLoading ? (
        <Skeleton className="h-full w-48 mx-auto" />
      ) : error ? (
        <span>Erro ao obter coordenadas.</span>
      ) : coords ? (
        <span>{`Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`}</span>
      ) : (
        <span>Obtendo coordenadas...</span>
      )}
    </div>
  );
}
