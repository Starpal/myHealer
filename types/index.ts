import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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