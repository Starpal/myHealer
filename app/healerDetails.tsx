import React, { useEffect, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import MapView, { Marker } from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalSearchParams } from "expo-router";
import { Healer } from "@/types/index";

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
console.log("Healer Details Params:", healer)
  // Example categories array, replace with real data as needed
  const categories = [
    {
      id: "1",
      name: "Energy Healing",
      icon: "leaf-outline",
      iconSet: "Ionicons",
    },
    {
      id: "2",
      name: "Sound Therapy",
      icon: "music-note",
      iconSet: "MaterialCommunityIcons",
    },
    {
      id: "3",
      name: "Meditation",
      icon: "meditation",
      iconSet: "MaterialCommunityIcons",
    },
  ];

   // Gestione del caso in cui i dati dell'healer non siano disponibili
  if (!healer) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Healer not found</ThemedText>
        <ThemedText>We're sorry, the healer details are not available.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#fff", dark: "#1D3D47" }}
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
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{healer.name}</ThemedText>
      </ThemedView>
        <ThemedView style={styles.stepContainer}>
            <ThemedText type="defaultSemiBold">{healer.about}</ThemedText>
            <ThemedText type="default">{healer.bio}</ThemedText>
             </ThemedView>
      <ThemedView style={styles.stepContainer}>
{/* FlatList of categories */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={healer.categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => ( 
            <TouchableOpacity
            style={[
              styles.categoryChip,
            ]}
            onPress={() => {}}
          >
                        {item.iconSet === "Ionicons" ? (
                          <Ionicons
                            name={item.icon as keyof typeof Ionicons.glyphMap}
                            size={20}
                            color={"#fff"}
                          />
                        ) : item.iconSet === "MaterialCommunityIcons" ? (
                          <MaterialCommunityIcons
                            name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                            size={20}
                            color={"#fff"}
                          />
                        ) : (
                          <Ionicons
                            name="help-circle-outline"
                            size={20}
                            color={"#fff"}
                          />
                        )}
                        <ThemedText
                          type="defaultSemiBold"
                          style={[
                            styles.categoryChipText
                          ]}
                        >
                          {item.name}
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                       />
             </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="defaultSemiBold">Social & Contacts</ThemedText>
        <ThemedText type="default"> {healer.contacts?.email}</ThemedText>
        <ThemedText type="default">{healer.contacts?.phone} </ThemedText>
        <ThemedText type="default">{healer.contacts?.whatsapp}  </ThemedText>
        <ThemedText type="default">{healer.contacts?.telegram}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.instagram} </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.facebook}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.facebook}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.youtube}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.tiktok}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.pinterest}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.twitter}  </ThemedText>
        <ThemedText type="default">{healer.socialMedia?.linkedin}  </ThemedText>
        <ThemedText type="default">{healer.contacts?.website}  </ThemedText>

      </ThemedView>
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
            <ThemedText type="default">City PROP</ThemedText>
            <ThemedText type="default">Country PROP</ThemedText>
            <MapView
                style={styles.miniMap}
          region={{
            latitude: 37.78825, // replace with actual latitude
            longitude: -122.4324, // replace with actual longitude
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
             <Marker
              coordinate={{
                latitude: 37.78825, // replace with actual latitude value or prop
                longitude: -122.4324 // replace with actual longitude value or prop
              }}
              //title={currentMapRegion.name}
            ></Marker>
            </MapView>
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
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    gap: 8,
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
  miniMap: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
});
