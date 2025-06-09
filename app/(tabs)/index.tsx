import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  Dimensions,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AllCategoriesModal from "@/components/ui/AllCategoriesModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MapView, { Marker } from "react-native-maps";
import { getCoordinates } from "@/utils/API";
import { getCurrentUserLocation } from "@/utils/LocationManager";
import { Category, LocationItem } from "@/types";

const categories: Category[] = [
  {
    id: "1",
    name: "Tarot",
    icon: "cards-outline",
    iconSet: "MaterialCommunityIcons",
    subcategories: ["Lettura generale", "Amore", "Carriera"],
  },
  {
    id: "2",
    name: "Astrology",
    icon: "planet-outline",
    iconSet: "Ionicons",
    subcategories: ["Tema natale", "Previsioni"],
  },
  {
    id: "3",
    name: "Quantum Leap",
    icon: "sparkles-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "4",
    name: "Yoga",
    icon: "yoga",
    iconSet: "MaterialCommunityIcons",
    subcategories: ["Hatha", "Vinyasa", "Ashtanga"],
  },
  {
    id: "5",
    name: "Meditation",
    icon: "meditation",
    iconSet: "MaterialCommunityIcons",
    subcategories: [],
  },
  {
    id: "6",
    name: "Nutrition",
    icon: "nutrition-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "7",
    name: "Reiki",
    icon: "hand-right-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "8",
    name: "Coaching",
    icon: "chatbubbles-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "9",
    name: "Massages",
    icon: "spa-outline",
    iconSet: "MaterialCommunityIcons",
    subcategories: [],
  },
  {
    id: "10",
    name: "Acupunture",
    icon: "flask-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "11",
    name: "Ayurveda",
    icon: "leaf-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "12",
    name: "Cristal therapy",
    icon: "diamond-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "13",
    name: "Naturopathy",
    icon: "nutrition-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "14",
    name: "Homeopathy",
    icon: "medical-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  {
    id: "15",
    name: "Chiropractic",
    icon: "body-outline",
    iconSet: "Ionicons",
    subcategories: [],
  },
  // TODO: Aggiungi altre categorie from API
];


const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const initialRegion = {
    name: "Ubud",
    latitude: -8.519268, // Latitudine di Ubud
    longitude: 115.263298, // Longitudine di Ubud
    latitudeDelta: 0.0922, // Delta latitude per la visualizzazione
    longitudeDelta: 0.0421, // Delta longitudine per la visualizzazione
  };

  const [searchText, setSearchText] = useState("");
	  const [displayedCategories, setDisplayedCategories] = useState(
    categories.slice(0, 5) // Initially show only the first 5
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [isAllCategoriesModalVisible, setIsAllCategoriesModalVisible] =
    useState(false);
  const categoriesFlatListRef = useRef<FlatList<Category>>(null);
  const [categoryChipWidth, setCategoryChipWidth] = useState(0);
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

  // Funzione per gestire la selezione della categoria (quando si clicca sui chip della FlatList principale)
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Resetta la sottocategoria al cambio di categoria
    // Ensure that if a category from the initial slice is selected, it's still centered
    const index = displayedCategories.findIndex(c => c.id === category.id);
    if (categoriesFlatListRef.current && index !== -1 && categoryChipWidth > 0) {
      const offset = (categoryChipWidth + 10) * index - (screenWidth / 2) + (categoryChipWidth / 2);
      categoriesFlatListRef.current.scrollToOffset({
        offset: Math.max(0, offset),
        animated: true,
      });
    }
  };

  // Gestisce la selezione di una categoria dalla modal
  const handleSelectCategoryFromModal = (category: Category) => {
  // Imposta la categoria selezionata
  setSelectedCategory(category);
  setSelectedSubcategory(null); // Resetta la sottocategoria

  // Chiudi la modal
  setIsAllCategoriesModalVisible(false);

  // Variabile per tenere traccia dell'array che verrà visualizzato.
  // La useremo sia per aggiornare lo stato, sia per il calcolo dello scroll.
  let categoriesToDisplay: Category[];

  // Aggiorna lo stato `displayedCategories`
  setDisplayedCategories((prevDisplayedCategories) => {
    const isCategoryAlreadyDisplayed = prevDisplayedCategories.some(
      (c) => c.id === category.id
    );

    if (isCategoryAlreadyDisplayed) {
      // Se è già presente, mantiene l'array corrente
      categoriesToDisplay = prevDisplayedCategories;
      return prevDisplayedCategories;
    } else {
      // Se la categoria NON è tra le visualizzate, aggiungila
      let newCategories = [...prevDisplayedCategories];

      if (newCategories.length >= 5) {
        newCategories.shift(); // Rimuovi il primo elemento (il più vecchio)
      }
      newCategories.push(category); // Aggiungi la nuova categoria alla fine

      categoriesToDisplay = newCategories; // Assegna l'array modificato a categoriesToDisplay
      return newCategories;
    }
  });

  // Scrolla la FlatList per centrare il chip (con slight delay)
  if (categoriesFlatListRef.current && categoryChipWidth > 0) {
    setTimeout(() => {
      // Trova l'indice della categoria selezionata NELL'ARRAY CHE VERRÀ VISUALIZZATO
      // `categoriesToDisplay` qui conterrà già l'array aggiornato (o quello precedente se non modificato)
      const targetIndex = categoriesToDisplay.findIndex(
        (c) => c.id === category.id
      );

      if (targetIndex !== -1) {
        // Usa scrollToIndex con viewPosition per centrare l'elemento
        categoriesFlatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
          viewPosition: 0.5, // Tenta di centrare l'elemento
        });
      }
    }, 100); // Un piccolo ritardo per permettere al re-render di completarsi
  }
};


  // Funzione per il calcolo del layout dell'elemento della FlatList
  const getItemLayout = (data: any, index: number) => {
    // Ensure CHIP_TOTAL_WIDTH is based on a measured value or a reasonable default
    const CHIP_TOTAL_WIDTH = categoryChipWidth > 0 ? categoryChipWidth + 10 : 120; // 10 for marginRight

    return {
      length: CHIP_TOTAL_WIDTH,
      offset: CHIP_TOTAL_WIDTH * index,
      index,
    };
  };

  // Funzione per misurare la larghezza di un chip di categoria
  const onChipLayout = (event: any) => {
    if (categoryChipWidth === 0 || event.nativeEvent.layout.width !== categoryChipWidth) {
      setCategoryChipWidth(event.nativeEvent.layout.width);
    }
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

  const handleGetLocation = async () => {
    const userLocation = await getCurrentUserLocation(); // Chiama la funzione esterna
    if (userLocation) {
      const newRegion = {
        name: userLocation.name,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: initialRegion.latitudeDelta, // Usa i delta iniziali o un valore predefinito
        longitudeDelta: initialRegion.longitudeDelta,
      };
      setLocationText(userLocation.name); // Imposta il testo della località
      setCurrentMapRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
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
          style={styles.logo}
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
          placeholder="Search by name..."
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
			TODO: Add 'Expand' to view all categories*/}
			<ThemedView style={styles.categoriesTitleContainer}>
      <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, styles.categoriesTitle]}>
        Choose a category
      </ThemedText>
			 <TouchableOpacity
    style={[styles.exploreMoreButton, 
		//	styles.standaloneExploreButton
		]} // Aggiungi uno stile per posizionarlo
    onPress={() => setIsAllCategoriesModalVisible(true)}
  >
    <ThemedText style={styles.exploreMoreText}>Explore All {'>'} </ThemedText>
  </TouchableOpacity>
</ThemedView>
     {/* FlatList of categories */}
      <FlatList
        ref={categoriesFlatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={displayedCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onLayout={onChipLayout}
            style={[
              styles.categoryChip,
              selectedCategory?.id === item.id && styles.categoryChipSelected,
            ]}
            onPress={() => handleCategorySelect(item)}
          >
            {item.iconSet === "Ionicons" ? (
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color={selectedCategory?.id === item.id ? "#fff" : "#6200EE"}
              />
            ) : item.iconSet === "MaterialCommunityIcons" ? (
              <MaterialCommunityIcons
                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={20}
                color={selectedCategory?.id === item.id ? "#fff" : "#6200EE"}
              />
            ) : (
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={selectedCategory?.id === item.id ? "#fff" : "red"}
              />
            )}
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
        // ListFooterComponent={() => (
        //   <TouchableOpacity
        //     style={styles.exploreMoreButton} // Nuovo stile
        //     onPress={() => setIsAllCategoriesModalVisible(true)} // Apre la modal
        //   >
        //     <ThemedText style={styles.exploreMoreText}>Explore All</ThemedText>
        //     <Ionicons
        //       name="chevron-forward-outline"
        //       size={20}
        //       color="#6200EE"
        //     />
        //   </TouchableOpacity>
        // )}
				  getItemLayout={getItemLayout}
        style={styles.categoriesList}
      />
      {/* Sottocategorie (mostrate solo se una categoria è selezionata e ha sottocategorie) */}
      {selectedCategory &&
        selectedCategory.subcategories.length > 0 &&
        selectedCategory.subcategories !== null && (
          <>
            <ThemedText style={styles.sectionTitle}>Subcategory</ThemedText>
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
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        Where?
      </ThemedText>
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
          onPress={handleGetLocation}
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
      {/* RENDER DELLA MODAL PER LE CATEGORIE */}
      <AllCategoriesModal
        visible={isAllCategoriesModalVisible}
        onClose={() => setIsAllCategoriesModalVisible(false)}
        categories={categories}
        onSelectCategory={handleSelectCategoryFromModal}
      />
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
  logo: {
		height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  sectionTitle: {
		fontSize: 17,
    fontWeight: "bold",
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
	categoriesTitleContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 20,
		marginBottom: 10,
		flexWrap: "nowrap",
	},
	categoriesTitle: {
		fontSize: 17,
		fontWeight: "bold",
	},
	 exploreMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    //backgroundColor: "#E8E8E8",
    borderRadius: 20,
    marginTop: 12,
  },
  exploreMoreText: {
    fontSize: 13,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginRight: 2,
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
	standaloneExploreButton: {
  alignSelf: 'flex-end', 
  marginRight: 15,    
  marginTop: 10,
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
