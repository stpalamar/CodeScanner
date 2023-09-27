import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';

import * as Linking from 'expo-linking';

import { AuthContext } from '../context/AuthContext';

import { collection, getDocs, orderBy, where, query } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

function StorageItem({ item }) {
  return (
    <View style={styles.itemContainer}>
      <Pressable
        onPress={() => {
          Alert.alert(
            'Open link',
            `Are you want open this link? ${item.data}`,
            [
              {
                text: 'Cancel',
                onPress: () => {
                  return;
                },
              },
              {
                text: 'Open',
                onPress: () => {
                  Linking.openURL(item.data);
                },
              },
            ]
          );
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#e8e8e8' : '#f2f2f2',
            borderRadius: 10,
            padding: 10,
          },
        ]}
      >
        <Text style={styles.itemLink}>{item.data}</Text>
        <Text style={styles.itemDate}>Saved: {item.date}</Text>
      </Pressable>
    </View>
  );
}

export default function StorageScreen() {
  const { uid } = useContext(AuthContext);
  const db = getFirestore(app);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'scans'),
      where('uid', '==', uid),
      orderBy('date', 'desc')
    );
    getDocs(q).then((querySnapshot) => {
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          data: doc.data().data,
          date: doc.data().date,
        });
      });
      setItems(items);
    });
  }, []);
  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Storage is empty</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => <StorageItem item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginVertical: 5,
    marginHorizontal: 20,
    backgroundColor: '#f2f2f2',
    elevation: 2,
    borderRadius: 10,
  },
  itemLink: {
    fontSize: 16,
    color: '#3662a8',
  },
  itemDate: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 26,
    textAlign: 'center',
  },
  emptyContainer: {
    height: '80%',
    justifyContent: 'center',
  },
});
