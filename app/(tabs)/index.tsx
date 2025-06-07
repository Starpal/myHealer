import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import type { ViewStyle } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";
import MapView, { Marker } from "react-native-maps";
import { getCoordinates } from "@/utils/API";

type IoniconName = keyof typeof Ionicons.glyphMap;
type LocationItem = {
  name: string;
  id: string | number;
  lat: string;
  lon: string;
};
type Category = {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
};

const categories: {
  id: string;
  name: string;
  icon: IoniconName;
  subcategories: string[];
}[] = [
  {
    id: "1",
    name: "Tarot",
    icon: "color-wand-outline",
    subcategories: ["Lettura generale", "Amore", "Carriera"],
  },
  {
    id: "2",
    name: "Astrology",
    icon: "planet-outline",
    subcategories: ["Tema natale", "Previsioni"],
  },
  {
    id: "3",
    name: "Quantum Leap",
    icon: "sparkles-outline",
    subcategories: [],
  },
  {
    id: "4",
    name: "Yoga",
    icon: "body-outline",
    subcategories: ["Hatha", "Vinyasa", "Ashtanga"],
  },
  { id: "5", name: "Meditazione", icon: "leaf-outline", subcategories: [] },
  { id: "6", name: "Nutrizione", icon: "nutrition-outline", subcategories: [] },
  // TODO: Aggiungi altre categorie from API
];

export default function HomeScreen() {
  const initialRegion = {
    name: "Ubud",
    latitude: -8.519268, // Latitudine di Ubud
    longitude: 115.263298, // Longitudine di Ubud
    latitudeDelta: 0.0922, // Delta latitude per la visualizzazione
    longitudeDelta: 0.0421, // Delta longitudine per la visualizzazione
  };

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [locationText, setLocationText] = useState("");
  const [locationsList, setLocationsList] = useState<
    LocationItem[] | undefined
  >();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentMapRegion, setCurrentMapRegion] = useState(initialRegion);

  const mapRef = useRef<MapView>(null);

  // Stile della mappa che cambia in base allo stato di espansione
  const mapStyle: ViewStyle = {
    height: isMapExpanded ? "80%" : 150,
    flex: isMapExpanded ? 1 : undefined,
    position: isMapExpanded ? "absolute" : "relative",
    top: isMapExpanded ? 0 : undefined,
    left: isMapExpanded ? 0 : undefined,
    right: isMapExpanded ? 0 : undefined,
    bottom: isMapExpanded ? 0 : undefined,
    zIndex: isMapExpanded ? 999 : 1,
  };

  // Funzione per avviare la ricerca
	// TODO: ricerca in API
  const handleSearch = (searchText: any) => {
    console.log("Ricerca avviata:", searchText);
  };

  // Funzione per gestire la selezione della categoria
  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Resetta la sottocategoria al cambio di categoria
  };

  // onRegionChangeComplete viene chiamato solo quando l'utente ha smesso di muovere la mappa.
  const onRegionChangeComplete = (newRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => {
    console.log("Regione cambiata (onRegionChangeComplete):", newRegion);
    setCurrentMapRegion({
      name: "", // OPTIONAL: cercare il nome attraverso geocoding inverso
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
      latitudeDelta: newRegion.latitudeDelta,
      longitudeDelta: newRegion.longitudeDelta,
    });
  };

  // Funzione per ottenere le coordinate dalla località inserita
  const onLocationSubmit = (locationText: string) => {
    if (locationText) {
      getCoordinates(locationText)
        .then((data: any[]) => {
          const dataExist = data.length > 0;
          const list = data.map((item) => {
            return {
              name: item.display_name.split(",")[0].trim(),
              id: item.place_id,
              lat: item.lat,
              lon: item.lon,
            };
          });

          if (dataExist) {
            console.log("Location text:", locationText);
            setLocationsList(list); // Aggiorna la lista dei risultati di ricerca

            const firstResult = list[0];
            const newMapRegion = {
              name: firstResult.name,
              latitude: parseFloat(firstResult.lat),
              longitude: parseFloat(firstResult.lon),
              latitudeDelta: initialRegion.latitudeDelta, // Mantiene i delta per lo zoom
              longitudeDelta: initialRegion.longitudeDelta,
            };

            // Aggiorna lo stato `currentMapRegion` con la nuova località
            setCurrentMapRegion(newMapRegion);

            // Anima la mappa usando `newMapRegion` direttamente
            // Non usa `region`, perché non è ancora stato aggiornato da `setCurrentMapRegion`.
            if (mapRef.current) {
              mapRef.current.animateToRegion(newMapRegion, 1000); // Anima in 1 secondo
            }
          } else {
            setLocationsList(undefined); // Nessun risultato
            // OPZIONALE: Potresti voler mostrare un alert o resettare la mappa alla posizione iniziale
            // se non viene trovata alcuna località.
          }
        })
        .catch((error: any) => {
          console.error("Error fetching coordinates:", error);
          setLocationsList(undefined); // In caso di errore, resetta la lista
        });
    } else {
      setLocationsList(undefined); // Se il testo è vuoto, resetta la lista
    }
  };

  useEffect(() => {
    if (!locationText) {
      setLocationsList(undefined);
    }
    // Anima la mappa alla posizione iniziale all'avvio del componente (una volta)
    // o quando `currentMapRegion` cambia per la prima volta.
    // Questo è utile se vuoi essere sicuro che la mappa si centri su `initialRegion`
    // anche se il componente ha un re-render.
    // L'animazione dovrebbe essere fatta solo se il ref è disponibile e la regione è impostata.
    if (mapRef.current && currentMapRegion) {
      mapRef.current.animateToRegion(currentMapRegion, 0); // Nessuna animazione per l'inizializzazione
    }
  }, [locationText, currentMapRegion]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source="https://retreathub.com/wp-content/uploads/2025/01/Shamans-Hand-Retreathub.png"
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Healer finder</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="defaultSemiBold">
          Find the best suitable healer around you.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          keyboardType="default"
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(searchText)}
          clearButtonMode="while-editing"
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Filtro per Categoria (esempio con FlatList di chip) 
			TODO: Add 'Expand' to view all cathegories*/}
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Choose a cathegory
      </ThemedText>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory?.id === item.id && styles.categoryChipSelected,
            ]}
            onPress={() => handleCategorySelect(item)}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={selectedCategory?.id === item.id ? "#fff" : "#6200EE"}
            />
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.categoryChipText,
                selectedCategory?.id === item.id &&
                  styles.categoryChipTextSelected,
              ]}
            >
              {item.name}
            </ThemedText>
          </TouchableOpacity>
        )}
        style={styles.categoriesList}
      />

      {/* Sottocategorie (mostrate solo se una categoria è selezionata e ha sottocategorie) */}
      {selectedCategory &&
        selectedCategory.subcategories.length > 0 &&
        selectedCategory.subcategories !== null && (
          <>
            <ThemedText style={styles.sectionTitle}>Sottocategoria</ThemedText>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={selectedCategory.subcategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.subcategoryChip,
                    selectedSubcategory === item &&
                      styles.subcategoryChipSelected,
                  ]}
                  onPress={() => setSelectedSubcategory(item)}
                >
                  <ThemedText
                    style={[
                      styles.subcategoryChipText,
                      selectedSubcategory === item &&
                        styles.subcategoryChipTextSelected,
                    ]}
                  >
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
              style={styles.subcategoriesList}
            />
          </>
        )}

      {/* Filtro per Località */}
      <ThemedText type="defaultSemiBold">Where?</ThemedText>
      <ThemedView style={styles.locationInputContainer}>
        <Ionicons
          name="location-outline"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Enter location..."
          placeholderTextColor="#888"
          value={locationText}
          onChangeText={setLocationText}
          returnKeyType="done"
          onSubmitEditing={() => onLocationSubmit(locationText)}
        />
        <TouchableOpacity
          onPress={() => alert("Ottieni posizione GPS")}
          style={styles.currentLocationButton}
        >
          <Ionicons name="locate-outline" size={24} color="#6200EE" />
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={[styles.mapContainer, mapStyle]}>
        {/* Bottone per espandere/ridurre la mappa */}
        <TouchableOpacity
          style={styles.expandMapButton} // Nuovo stile
          onPress={() => setIsMapExpanded(!isMapExpanded)}
        >
          <Ionicons
            name={isMapExpanded ? "contract-outline" : "expand-outline"} // Icona dinamica
            size={24}
            color="#6200EE"
          />
        </TouchableOpacity>

        <MapView
          ref={mapRef}
          style={styles.miniMap}
          region={currentMapRegion}
          onRegionChangeComplete={onRegionChangeComplete}
        >
          {currentMapRegion && (
            <Marker
              coordinate={{
                latitude: currentMapRegion.latitude,
                longitude: currentMapRegion.longitude,
              }}
              title={currentMapRegion.name} // Usa il nome dalla regione corrente
            >
              <ThemedText type="defaultSemiBold">
                {currentMapRegion.name}
              </ThemedText>
            </Marker>
          )}
        </MapView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    borderWidth: 0,
    padding: 0,
  },
  clearButton: {
    padding: 5,
  },
  categoriesList: {
    marginBottom: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  categoryChipSelected: {
    backgroundColor: "#6200EE",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 5,
  },
  categoryChipTextSelected: {
    color: "#fff",
  },
  subcategoriesList: {
    marginBottom: 10,
    marginTop: 5,
  },
  subcategoryChip: {
    backgroundColor: "#F2F2F2",
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  subcategoryChipSelected: {
    backgroundColor: "#BB86FC",
    borderColor: "#6200EE",
  },
  subcategoryChipText: {
    fontSize: 13,
    color: "#555",
  },
  subcategoryChipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  currentLocationButton: {
    paddingLeft: 10,
  },
  mapContainer: {
    borderRadius: 15,
    backgroundColor: "#F2F2F2",
    elevation: 3,
  },
  miniMap: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  expandMapButton: {
    position: "absolute", // Posiziona in alto a destra della mappa
    top: 10,
    right: 10,
    zIndex: 1000, // Assicura che sia sopra la mappa
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 5,
  },
});
