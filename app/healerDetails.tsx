import React from "react";
import { Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import MapView, { Marker } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";
import { Healer } from "@/types/index";
import { contactsSocialMediaConfigurations } from "@/constants/ContactsSocialMedia";

export default function healerDetails() {
  const params = useLocalSearchParams();
  let healer: Healer | null = null;
  if (typeof params.healer === "string") {
    try {
      healer = JSON.parse(params.healer) as Healer;
    } catch {
      healer = null;
    }
  }
  if (!healer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Healer not found</ThemedText>
        <ThemedText>
          We're sorry, the healer details are not available.
        </ThemedText>
      </ThemedView>
    );
  }

  if (
    !healer ||
    typeof healer.latitude !== "number" ||
    typeof healer.longitude !== "number"
  ) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Healer not found</ThemedText>
        <ThemedText>
          We're sorry, the healer details are not available or coordinates are
          missing.
        </ThemedText>
      </ThemedView>
    );
  }

  // Definisci la regione iniziale della mappa per centrarla sull'healer
  const initialMapRegion = {
    latitude: healer.latitude ?? 0,
    longitude: healer.longitude ?? 0,
    latitudeDelta: 0.005, // Un piccolo delta per uno zoom ravvicinato sull'healer
    longitudeDelta: 0.005,
  };

  const hasContactInfo =
    healer.contacts?.email ||
    healer.contacts?.phone ||
    healer.contacts?.whatsapp ||
    healer.contacts?.telegram ||
    healer.contacts?.website ||
    healer.socialMedia?.instagram ||
    healer.socialMedia?.facebook ||
    healer.socialMedia?.youtube ||
    healer.socialMedia?.tiktok ||
    healer.socialMedia?.pinterest ||
    healer.socialMedia?.twitter ||
    healer.socialMedia?.linkedin;

  // Funzione helper per accedere a proprietà annidate (es. healer.contacts.email)
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#fff", dark: "#151718" }}
      headerImage={
        healer.profileImage ? (
          <Image source={healer.profileImage} style={styles.logo} />
        ) : (
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1494243762909-b498c7e440a9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzN8fGF1cm9yYXxlbnwwfHwwfHx8MA%3D%3D",
            }}
            style={styles.logo}
          />
        )
      }
      contentPaddingTop={0}
    >
      {/* SEZIONE NOME E HEALERNAME */}
      {(healer.name || healer.healerName) && (
        <ThemedView style={styles.titleContainer}>
          {healer.name && (
            <ThemedText type="title" style={styles.title}>
              {healer.name}
            </ThemedText>
          )}
          {healer.healerName && (
            <ThemedText type="defaultSemiBold">{healer.healerName}</ThemedText>
          )}
        </ThemedView>
      )}
      {/* SEZIONE ABOUT E BIO */}
      {(healer.about || healer.bio) && (
        <ThemedView style={styles.stepContainer}>
          {healer.about && (
            <ThemedText type="defaultSemiBold">{healer.about}</ThemedText>
          )}
          {healer.bio && <ThemedText type="default">{healer.bio}</ThemedText>}
        </ThemedView>
      )}

      {/* HEALER CATEGORIES */}
      {healer.offeredServices && healer.offeredServices.length > 0 && (
        <ThemedView style={styles.categoriesContainer}>
          {healer.offeredServices.map((item, index) => (
            // Sostituito TouchableOpacity con ThemedView
            <ThemedView
              key={item.id || index.toString()} // Assicurati una chiave unica
              style={[styles.categoryChip]}
            >
              {item.iconSet === "Ionicons" ? (
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={"#fff"}
                />
              ) : item.iconSet === "MaterialCommunityIcons" ? (
                <MaterialCommunityIcons
                  name={
                    item.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={20}
                  color={"#fff"}
                />
              ) : (
                <Ionicons name="help-circle-outline" size={20} color={"#fff"} />
              )}
              <ThemedText
                type="defaultSemiBold"
                style={styles.categoryChipText}
              >
                {item.name}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {hasContactInfo && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="defaultSemiBold">Social & Contacts</ThemedText>

          {contactsSocialMediaConfigurations.map((config) => {
            const value = getNestedValue(healer, config.propPath); // Ottieni il valore dall'oggetto healer
            if (value) {
              // Renderizza solo se il valore esiste
              const displayValue = config.getDisplayValue(value);
              const url = config.getUrl(value);

              return (
                <TouchableOpacity
                  key={config.id} // Chiave unica per l'elemento della lista
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(url)}
                >
                  {config.iconSet === "Ionicons" ? (
                    <Ionicons
                      name={config.iconName as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color="gray"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={
                        config.iconName as keyof typeof MaterialCommunityIcons.glyphMap
                      }
                      size={24}
                      color="gray"
                    />
                  )}
                  <ThemedText type="default">{displayValue}</ThemedText>
                </TouchableOpacity>
              );
            }
            return null; // Non renderizzare nulla se il valore non esiste
          })}
        </ThemedView>
      )}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="defaultSemiBold">Services & Therapies</ThemedText>
      </ThemedView>
      {healer.services?.map((service) => (
        <ThemedView key={service.id} style={styles.stepContainer}>
          <ThemedText type="defaultSemiBold">{service.name}</ThemedText>
          <ThemedText type="default">{service?.description}</ThemedText>
          <ThemedText type="default">Price: ${service.price}</ThemedText>
          <ThemedText type="default">Duration: {service.duration}</ThemedText>
        </ThemedView>
      ))}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="defaultSemiBold">Location</ThemedText>
        <ThemedText type="default">{healer.address}</ThemedText>

        {/* Mostra la mappa solo se le coordinate sono valide */}
        {healer.latitude !== undefined &&
        healer.longitude !== undefined &&
        healer.latitude !== 0 &&
        healer.longitude !== 0 ? (
          <MapView style={styles.miniMap} initialRegion={initialMapRegion}>
            <Marker
              coordinate={{
                latitude: healer.latitude,
                longitude: healer.longitude,
              }}
              title={healer.name || healer.healerName}
              description={healer.address}
            />
          </MapView>
        ) : (
          // Messaggio se le coordinate non sono disponibili
          <ThemedText style={styles.miniMapPlaceholder}>
            Map not available for this location.
          </ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  logo: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  titleContainer: {
    padding: 16,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipText: {
    marginLeft: 8,
    color: "#333",
    fontSize: 16,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // Spazio tra icona e testo
    paddingVertical: 4, // Piccolo padding verticale per ogni riga
  },
  miniMap: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  miniMapPlaceholder: {
    // stile per il messaggio di "mappa non disponibile"
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#f0f0f0",
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 200, // Centra verticalmente il testo
    color: "#666",
  },
});
