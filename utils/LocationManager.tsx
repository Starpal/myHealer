// utils/LocationManager.tsx (o dove preferisci posizionarlo)
import * as Location from "expo-location";
import { Alert } from "react-native";

interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

// Funzione che gestisce l'ottenimento della posizione corrente
export const getCurrentUserLocation =
  async (): Promise<LocationResult | null> => {
    // 1. Richiede i permessi di localizzazione
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location Permissions Denied",
        "Please enable location permissions in your device settings to use this feature."
      );
      return null;
    }

    try {
      // 2. Ottiene la posizione corrente
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      // 3. (Opzionale) Reverse Geocoding per ottenere un nome di località
      let locationName = "My current Location"; // Nome predefinito se il reverse geocoding fallisce
      try {
        const geocodedLocation = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (geocodedLocation && geocodedLocation.length > 0) {
           const {
              city,
              district,
              subregion,
              region,
              country,
              // ... altre proprietà ...
            } = geocodedLocation[0];

            let rawLocationName: string; // Variabile temporanea per il nome completo

            if (district) {
              rawLocationName = `${district}, ${country || ""}`;
            } else if (city) {
              rawLocationName = `${city}, ${country || ""}`;
            } else if (subregion) {
              rawLocationName = `${subregion}, ${country || ""}`;
            } else if (region) {
              rawLocationName = `${region}, ${country || ""}`;
            } else {
              rawLocationName = `${geocodedLocation[0].name || "Unknown Location"}, ${country || ""}`;
            }

            // Trova l'indice della prima virgola
            const commaIndex = rawLocationName.indexOf(',');
            if (commaIndex !== -1) {
                // Se c'è una virgola, prendi solo la parte prima di essa
                locationName = rawLocationName.substring(0, commaIndex).trim();
            } else {
                // Altrimenti, usa il nome completo (se non c'è virgola)
                locationName = rawLocationName.trim();
            }
            //console.log("Current location (geocoded):", locationName);
          }
      } catch (geocodeError) {
        console.warn("Reverse geocoding error:", geocodeError);
        // Continua anche se il reverse geocoding fallisce
      }
      // 4. Restituisce i dati della posizione
      return {
        name: locationName,
        latitude: latitude,
        longitude: longitude,
        // latitudeDelta: 0.0922,
        // longitudeDelta: 0.0421,
      };
    } catch (error: any) {
      console.error("Errore nell'ottenere la posizione GPS:", error);
      Alert.alert(
        "GPS error",
        `Unable to get current location. Make sure GPS is active. ${
          error.message || error
        }`
      );
      return null;
    }
  };
