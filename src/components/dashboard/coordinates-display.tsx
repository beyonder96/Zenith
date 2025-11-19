"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function CoordinatesDisplay() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getLocation = () => {
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

    const storedCoords = localStorage.getItem("zenith-vision-coords");
    if (storedCoords) {
      try {
        setCoords(JSON.parse(storedCoords));
      } catch {
        getLocation();
      }
      setIsLoading(false);
    } else {
      getLocation();
    }
  }, []);

  return (
    <p className="text-muted-foreground mt-2 text-sm">
      {isLoading && <Skeleton className="h-4 w-48 mx-auto" />}
      {error && `Erro ao obter coordenadas.`}
      {!isLoading && !error && !coords && `Obtendo coordenadas...`}
      {!isLoading && coords && `Aguardando suas coordenadas.`}
    </p>
  );
}
