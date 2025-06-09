// components/AllCategoriesModal.tsx
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Category, IoniconName, MaterialCommunityIconName } from '../../types';

const { width } = Dimensions.get('window'); // Per layout a griglia

interface AllCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

const AllCategoriesModal: React.FC<AllCategoriesModalProps> = ({
  visible,
  onClose,
  categories,
  onSelectCategory,
}) => {
  const handleSelect = (category: Category) => {
    onSelectCategory(category);
    onClose(); // Chiudi la modal dopo la selezione
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryGridItem}
      onPress={() => handleSelect(item)}
    >
      {item.iconSet === "Ionicons" ? (
        <Ionicons name={item.icon as IoniconName} size={40} color="#6200EE" />
      ) : (
        <MaterialCommunityIcons name={item.icon as MaterialCommunityIconName} size={40} color="#6200EE" />
      )}
      <ThemedText style={styles.categoryGridText}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalHeader}>
          <ThemedText type="title">Explore All Categories</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close-circle-outline" size={30} color="#6200EE" />
          </TouchableOpacity>
        </ThemedView>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          numColumns={2} // Mostra le categorie in una griglia di 2 colonne
          contentContainerStyle={styles.categoryGrid}
        />
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingTop: 50, // Spazio per la status bar
    backgroundColor: '#f8f8f8', // O il tuo colore di sfondo
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  closeButton: {
    padding: 6,
  },
  categoryGrid: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryGridItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: (width / 2) - 30, // Larghezza per 2 colonne con margini
    height: (width / 2) - 30, // Rende i riquadri quadrati
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryGridText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default AllCategoriesModal;