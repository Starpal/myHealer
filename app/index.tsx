import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Image } from "expo-image";
import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AutocompleteDropdown,
  IAutocompleteDropdownRef,
} from "react-native-autocomplete-dropdown";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AllCategoriesModal from "@/components/ui/AllCategoriesModal";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MapView, { Marker, MapMarker } from "react-native-maps";
import { getCoordinates } from "@/utils/API";
import { getCurrentUserLocation } from "@/utils/locationManager";
import { Category, LocationItem } from "@/types";
import { categories } from "@/constants/Categories";
import { healers } from "@/constants/Healers";
import { Healer, HealerSuggestionItem } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initialRegion = {
    name: "Ubud",
    latitude: -8.519268, // Latitudine di Ubud
    longitude: 115.263298, // Longitudine di Ubud
    latitudeDelta: 0.0922, // Delta latitude per la visualizzazione
    longitudeDelta: 0.0421, // Delta longitudine per la visualizzazione
  };

  const [searchText, setSearchText] = useState("");
  const [suggestionsList, setSuggestionsList] = useState<
    HealerSuggestionItem[] | null
  >(null);
  const [selectedHealer, setSelectedHealer] = useState<Healer | null>(null);
  const [dropdownCalculatedTop, setDropdownCalculatedTop] = useState<
    number | null
  >(null);
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
  const [categoryChipWidth, setCategoryChipWidth] = useState(0);
  const [locationText, setLocationText] = useState("");
  const [locationsList, setLocationsList] = useState<
    LocationItem[] | undefined
  >();
  const [activeHealerId, setActiveHealerId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [currentMapRegion, setCurrentMapRegion] = useState(initialRegion);

  const dropdownController = useRef<IAutocompleteDropdownRef | null>(null);
  const categoriesFlatListRef = useRef<FlatList<Category>>(null);
  const searchRef = useRef(null);
  const searchBarRef = useRef<View>(null); // Ref per il ThemedView della searchBar
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: string]: MapMarker | null }>({});

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height; // Ottieni l'altezza dello schermo

  // Calcolo dell'altezza della mappa quando è espansa
  // Questo valore può variare a seconda di quanti elementi UI rimangono visibili sopra la mappa espansa
  // HEADER_HEIGHT è 220 dal ParallaxScrollView.
  // Se l'header scompare, potrebbe essere solo insets.top da sottrarre.
  // Per ora, assumiamo che la mappa espansa debba coprire l'intera altezza visibile tra la status bar e la tab bar.
  const mapExpandedCalculatedHeight = screenHeight - insets.top - insets.bottom;

  // Calcolo della larghezza desiderata per AutocompleteDropdown
  // Sostituisci 30, 20, 30 con le dimensioni effettive dei tuoi elementi + margini/padding.
  // 30 (padding searchBarContainer) + 20 (icona search) + 30 (bottone clear) = 80px di spazio fisso
  const autocompleteDropdownCalculatedWidth = screenWidth - 15 * 2 - 20 - 30; // Esempio: 30px di padding + 20px icona + 30px bottone
  // Potresti aver bisogno di un piccolo buffer aggiuntivo:
  // const autocompleteDropdownCalculatedWidth = screenWidth - (15 * 2) - 20 - 30 - 10;

  // Stile della mappa che cambia in base allo stato di espansione
  const mapStyle: ViewStyle = {
    height: isMapExpanded ? mapExpandedCalculatedHeight : 150,
    flex: isMapExpanded ? 1 : undefined,
    position: isMapExpanded ? "absolute" : "relative",
    top: isMapExpanded ? 0 : undefined,
    left: isMapExpanded ? 0 : undefined,
    right: isMapExpanded ? 0 : undefined,
    bottom: isMapExpanded ? insets.bottom : undefined,
    zIndex: isMapExpanded ? 999 : 1,
  };

  // --- FUNZIONE PER OTTENERE I SUGGERIMENTI (CHIAMATA AD OGNI CAMBIO DI TESTO) ---
  const getSuggestions = useCallback(async (q: string) => {
    console.log("getSuggestions chiamato con q:", q); // AGGIUNGI QUESTO

    if (typeof q !== "string" || q.length < 2) {
      setSuggestionsList(null);
      return;
    }

    const lowercasedQ = q.toLowerCase();
    const filtered = healers.filter(
      (healer) =>
        healer.name?.toLowerCase().includes(lowercasedQ) ||
        healer.healerName?.toLowerCase().includes(lowercasedQ)
    );

    const mappedSuggestions: HealerSuggestionItem[] = filtered.map(
      (healer) => ({
        id: healer.id,
        title:
          healer.name ||
          healer.healerName ||
          healer.address?.split(",")[0] ||
          "N/A",
        healerData: healer,
      })
    );
    console.log("Suggerimenti mappati:", mappedSuggestions); // AGGIUNGI QUESTO

    setSuggestionsList(mappedSuggestions);
  }, []);

  // AL SELEZIONARE PORTA AL PROFILO DELL'HEALER --- FUNZIONE QUANDO UN SUGGERIMENTO VIENE SELEZIONATO ---
  const onSelectItem = (item: any) => {
    console.log("SELECTED", item);
    if (item) {
      console.log("Healer selezionato:", item);
      setSelectedHealer(item.healerData);
      setSearchText(item.title);
      console.log("Healer selezionato:", item.healerData);
      router.push({
        pathname: "/healerDetails", // Il nome del file della pagina (senza estensione)
        params: { healer: JSON.stringify(item.healerData) }, // <--- PASSA I DATI QUI
      });
    } else {
      setSelectedHealer(null);
      if (searchText.trim() === "") {
        setSuggestionsList(null);
      }
    }
  };

  const onSearchBarLayout = useCallback(() => {
    if (searchBarRef.current) {
      searchBarRef.current.measure((fx, fy, width, height, px, py) => {
        // py + height è il bordo inferiore della search bar.
        let finalCalculatedTop = py + height;

        // Compensazione aggressiva per un possibile offset negativo interno della libreria.
        // Prova valori come 60, 80, 100 finché non lo vedi scendere correttamente.
        // Iniziamo con un valore alto per essere sicuri che si sposti.
        const aggressiveOffsetCompensation = 80; // Era 45. Proviamo un valore molto più alto.

        finalCalculatedTop += aggressiveOffsetCompensation;

        setDropdownCalculatedTop(finalCalculatedTop);
      });
    }
  }, []);

  // Funzione per gestire la selezione della categoria
  const handleCategorySelect = (category: Category) => {
  // Se la categoria selezionata è la stessa, deselezionala
  if (selectedCategory && selectedCategory.id === category.id) { // Assuming 'selectedCategory' is accessible here
    setSelectedCategory(null); // Deseleziona la categoria
    setSelectedSubcategory(null); // Resetta anche la sottocategoria
  } else {
    setSelectedCategory(category); // Seleziona la nuova categoria
    setSelectedSubcategory(null); // Resetta la sottocategoria al cambio di categoria
  }
  // Ensure that if a category from the initial slice is selected, it's still centered
  const index = displayedCategories.findIndex((c) => c.id === category.id);
  if (
    categoriesFlatListRef.current &&
    index !== -1 &&
    categoryChipWidth > 0
  ) {
    const offset =
      (categoryChipWidth + 10) * index -
      screenWidth / 2 +
      categoryChipWidth / 2;
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
    const CHIP_TOTAL_WIDTH =
      categoryChipWidth > 0 ? categoryChipWidth + 10 : 120; // 10 for marginRight

    return {
      length: CHIP_TOTAL_WIDTH,
      offset: CHIP_TOTAL_WIDTH * index,
      index,
    };
  };

  // Funzione per misurare la larghezza di un chip di categoria
  const onChipLayout = (event: any) => {
    if (
      categoryChipWidth === 0 ||
      event.nativeEvent.layout.width !== categoryChipWidth
    ) {
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

  // Funzione per filtrare gli healer in base alla categoria e sottocategoria selezionate
  const filteredHealers = useMemo(() => {
    if (!selectedCategory) {
      return healers; // Nessuna categoria selezionata, mostra tutti gli healer
    }

    const categoryId = selectedCategory.id;

    let filtered = healers.filter((healer) =>
      healer.categories?.includes(categoryId)
    );

    if (selectedSubcategory) {
      // Filtra ulteriormente per sottocategoria
      filtered = filtered.filter((healer) =>
        healer.offeredServices?.some(
          (service) => service.name === selectedSubcategory
        )
      );
    }
    return filtered;
  }, [selectedCategory, selectedSubcategory]);

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

  // Funzione per nascondere uno specifico callout
  const hideSpecificCallout = useCallback((healerId: string) => {
    if (markerRefs.current[healerId]) {
      markerRefs.current[healerId]?.hideCallout();
    }
  }, []);

  // Funzione per mostrare uno specifico callout, gestendo i conflitti e il "bounce"
  const showSpecificCallout = useCallback(
    (healerId: string) => {
      // Caso 1: L'utente clicca sul marker che ha già il callout aperto. Chiudilo.
      if (activeHealerId === healerId) {
        hideSpecificCallout(healerId);
        setActiveHealerId(null); // Nessun callout attivo ora
        return; // Esci dalla funzione dopo aver chiuso
      }

      // Caso 2: C'è un altro callout attivo. Chiudi quello precedente.
      if (activeHealerId && activeHealerId !== healerId) {
        hideSpecificCallout(activeHealerId);
      }

      // Imposta il nuovo healer come attivo
      setActiveHealerId(healerId);

      // Mostra il callout per il marker corrente.
      // Il setTimeout è cruciale. Permette a React Native Maps di aggiornare
      // i suoi stati interni prima di chiamare `showCallout()`, prevenendo il "flickering".
      setTimeout(() => {
        if (markerRefs.current[healerId]) {
          markerRefs.current[healerId]?.showCallout();
        }
      }, 50); // Un piccolo ritardo (50ms) per maggiore stabilità
    },
    [activeHealerId, hideSpecificCallout] // Dipendenze per useCallback
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#fff", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={
            "https://images.unsplash.com/photo-1494243762909-b498c7e440a9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fGF1cm9yYXxlbnwwfHwwfHx8MA%3D%3D"
          } // Path to your image
          //"https://retreathub.com/wp-content/uploads/2025/01/Shamans-Hand-Retreathub.png"
          style={styles.logo}
        />
      }
      headerButton={
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => console.log("I'm a Healer")}
        >
          <ThemedText type="defaultSemiBold" style={styles.headerButtonText}>
            I'm a Healer
          </ThemedText>
        </TouchableOpacity>
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
      <ThemedView
        ref={searchBarRef}
        onLayout={onSearchBarLayout}
        style={styles.searchBarContainer}
      >
        <Ionicons
          name="search"
          size={20}
          color="gray"
          style={styles.searchIcon}
        />
        <AutocompleteDropdown
          ref={searchRef}
          controller={(c) => (dropdownController.current = c)}
          clearOnFocus={false}
          closeOnBlur={true}
          closeOnSubmit={false}
          // onSelectItem={()=>onSelectItem(item)}
          dataSet={suggestionsList}
          suggestionsListTextStyle={{ color: "#333" }}
          suggestionsListContainerStyle={[
            styles.dropdownContainer,
            { zIndex: 1, position: "absolute" }, // QUI applichiamo il top calcolato
          ]}
          textInputProps={{
            placeholder: "Search by name...",
            placeholderTextColor: "#888",
            keyboardType: "default",
            returnKeyType: "search",
            style: styles.searchInput,
          }}
          renderItem={(item: any) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => onSelectItem(item)}
            >
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              {item.healerData?.healerName && (
                <ThemedText
                  type="default"
                  style={{ fontSize: 12, color: "#666" }}
                >
                  {item.healerData.healerName}
                </ThemedText>
              )}
              {item.healerData?.address && (
                <ThemedText
                  type="default"
                  style={{ fontSize: 12, color: "#999" }}
                >
                  {item.healerData.address.split(",")[0]}
                </ThemedText>
              )}
            </TouchableOpacity>
          )}
          onChangeText={getSuggestions}
          flatListProps={{
            keyboardShouldPersistTaps: "handled",
          }}
          containerStyle={{
            // width: autocompleteDropdownCalculatedWidth,
            flex: 1, // Seleziona il restante spazio flessibile
          }}
        />
        <TouchableOpacity
          onPress={() => {
            setSearchText("");
            setSuggestionsList(null);
            setSelectedHealer(null);
          }}
          style={[
            styles.clearButton,
            searchText.length === 0 && { opacity: 0, pointerEvents: "none" },
          ]}
        >
          <Ionicons name="close-circle" size={20} color="#888" />
        </TouchableOpacity>
      </ThemedView>

      {/* --- SEZIONE RISULTATI DI RICERCA / HEALER SELEZIONATO (modifica) --- */}
      {/* {selectedHealer && searchText.length > 0 && (
        <ThemedView style={styles.searchResultsContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Selected Healer:
          </ThemedText>
          <ThemedView style={styles.healerCard}>
            <ThemedText type="defaultSemiBold">
              {selectedHealer.name}
            </ThemedText>
            {selectedHealer.healerName && (
              <ThemedText type="default">
                Healer: {selectedHealer.healerName}
              </ThemedText>
            )}
            <ThemedText type="default">{selectedHealer.address}</ThemedText>
            <ThemedText type="default" style={styles.categoriesText}>
              Categories: {selectedHealer.categories ? selectedHealer.categories.join(", ") : "N/A"}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      )} */}

      {/* Filtro per Categoria (esempio con FlatList di chip) 
			TODO: Add 'Expand' to view all categories*/}
      <ThemedView style={styles.categoriesTitleContainer}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.sectionTitle, styles.categoriesTitle]}
        >
          Choose a category
        </ThemedText>
        <TouchableOpacity
          style={styles.exploreMoreButton}
          onPress={() => setIsAllCategoriesModalVisible(true)}
        >
          <ThemedText style={styles.exploreMoreText}>Explore All</ThemedText>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color="#666666"
          />
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
        getItemLayout={getItemLayout}
        style={styles.categoriesList}
      />
      {/* Sottocategorie (mostrate solo se una categoria è selezionata e ha sottocategorie) */}
      {selectedCategory &&
        selectedCategory.subcategories &&
        selectedCategory.subcategories.length > 0 && (
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
          style={styles.expandMapButton}
          onPress={() => setIsMapExpanded(!isMapExpanded)}
        >
          <Ionicons
            name={isMapExpanded ? "contract-outline" : "expand-outline"}
            size={24}
            color="#6200EE"
          />
        </TouchableOpacity>

        <MapView
          ref={mapRef}
          style={styles.miniMap}
          region={currentMapRegion} // La mappa è controllata da questo stato
          onRegionChangeComplete={onRegionChangeComplete}
          onPress={() => {
            if (activeHealerId) {
              hideSpecificCallout(activeHealerId);
              setActiveHealerId(null); // Resetta lo stato del callout attivo
            }
          }}
        >
          {currentMapRegion && (
            <Marker
              coordinate={{
                latitude: currentMapRegion.latitude,
                longitude: currentMapRegion.longitude,
              }}
              title={currentMapRegion.name}
            >
              <ThemedText type="defaultSemiBold">
                {currentMapRegion.name}
              </ThemedText>
            </Marker>
          )}
          {/* Aggiungi i Marker per gli healer */}
          {filteredHealers.map((healer) => {
            // Controlla se latitude e longitude sono presenti e valide
            if (
              healer.latitude !== undefined &&
              healer.longitude !== undefined
            ) {
              return (
                <Marker
                  key={healer.id}
                  coordinate={{
                    latitude: healer.latitude,
                    longitude: healer.longitude,
                  }}
                  title={healer.name || healer.healerName || "Healer"}
                  ref={(el: MapMarker | null) => {
                    markerRefs.current[healer.id] = el;
                  }}
                  onPress={() => showSpecificCallout(healer.id)}
                  // Quando il callout (l'etichetta) viene cliccato, naviga e chiudi il callout
                  onCalloutPress={() => {
                    hideSpecificCallout(healer.id);
                    setActiveHealerId(null);
                    router.push({
                      pathname: "/healerDetails",
                      params: { healer: JSON.stringify(healer) },
                    });
                    // Chiudi il callout e resetta lo stato dopo la navigazione.
                    // Anche qui un piccolo ritardo per una transizione visiva più fluida.
                    // setTimeout(() => {
                    // }, 50);
                  }}
                />
              );
            }
            return null;
          })}
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
  headerButton: {
    position: "absolute",
    top: 60,
    right: 0,
    backgroundColor: "#6200EE",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1000, // Assicura che il bottone sia sopra l'immagine di sfondo
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 5,
  },
  logo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    top: 50,
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
    backgroundColor: "#F2F2F2",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
    height: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 999,
    width: "100%",
    alignSelf: "stretch",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchResultsContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    width: "100%",
    alignSelf: "stretch",
  },
  healerCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoriesText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingRight: 10,
    height: "100%",
    // minWidth: Dimensions.get('window').width * 0.8,
    // maxWidth: "100%",
  },
  // --- NUOVI STILI PER L'AUTOCOMPLETE DROPDOWN ---
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 200,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    width: "100%",
    zIndex: 998,
    position: "absolute",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  clearButton: {
    padding: 5,
    width: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderRadius: 20,
    marginTop: 13,
  },
  exploreMoreText: {
    color: "#666666",
    fontSize: 15,
    marginRight: 2,
    marginBottom: 1,
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
