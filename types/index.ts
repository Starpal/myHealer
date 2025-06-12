import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ImageSourcePropType } from "react-native";

export type IoniconName = keyof typeof Ionicons.glyphMap;
export type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;
export type IconSetName = "Ionicons" | "MaterialCommunityIcons";

export type LocationItem = {
  name: string;
  id: string | number;
  lat: string;
  lon: string;
};

export type Category = {
  iconSet: IconSetName;
  id: string;
  name: string;
  icon: IoniconName | MaterialCommunityIconName;
  subcategories: string[];
};

export interface Healer {
    id: string;
    name?: string;
    healerName?: string;
    about?: string;
    bio?: string;
    profileImage?: ImageSourcePropType;
    contacts?: {
        email?: string;
        phone?: string; 
        whatsapp?: string;
        telegram?: string;
        website?: string;
      };
      socialMedia?: {
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        pinterest?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };
    address?: string;
    categories: Category[];
    services?: {
        id: string;
        name: string;
        description?: string;
        price: number;
        duration: string; // e.g., "60 minutes"
    }[];
}

export interface HealerSuggestionItem {
  id: string;
  title: string;
  healerData: Healer;
}