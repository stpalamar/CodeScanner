import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { BarCodeScanner } from 'expo-barcode-scanner';
import Constants from 'expo-constants';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';

import ScannerView from '../components/ScannerView';

import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

import { AuthContext } from '../context/AuthContext';

export default function ScannerScreen({ navigation }) {
  const db = getFirestore(app);
  const { signOut, uid } = useContext(AuthContext);
  const [scanned, setScanned] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <TouchableOpacity
              style={{ marginRight: 35 }}
              onPress={() => {
                navigation.navigate('StorageScreen');
              }}
            >
              <Ionicons name="list-outline" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to logout?', [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      return;
                    },
                  },
                  {
                    text: 'Logout',
                    onPress: () => signOut(),
                  },
                ]);
              }}
            >
              <Ionicons name="log-out-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>
        );
      },
    });
  });

  const saveToStorage = async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'scans'), {
        data: data,
        date: new Date().toLocaleString(),
        uid: uid,
      });
      console.log('Document successfully written! ' + docRef.id);
      Alert.alert('Success', 'Data saved to store');
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Error adding document: ', e);
    }
  };

  const startScan = () => {
    setScanned(false);

    // Request camera permission
    if (!hasPermission) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    Alert.alert('Scanned QR code', `Data: "${data}"`, [
      {
        text: 'Scan again',
        onPress: () => setScanned(false),
      },
      {
        text: 'Save',
        onPress: async () => {
          await saveToStorage(data);
        },
      },
      {
        text: 'Open',
        onPress: async () => {
          await saveToStorage(data);
          Linking.openURL(data);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {!scanned && hasPermission && (
        <View style={{ flex: 1 }}>
          {/* https://docs.expo.io/versions/latest/sdk/bar-code-scanner/ */}
          <BarCodeScanner
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />

          <View style={styles.helpTextWrapper}>
            <Text style={styles.helpText}>Find QR Code to scan</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {scanned !== null && hasPermission === null && (
          <Text style={styles.helpText}>Requesting for camera permission</Text>
        )}

        {scanned !== null && hasPermission === false && (
          <Text style={styles.helpText}>No access to camera</Text>
        )}

        {scanned === false && hasPermission && (
          <ScannerView scanned={scanned} />
        )}

        {scanned !== false && (
          <TouchableOpacity style={styles.button} onPress={startScan}>
            <Text style={styles.buttonText}>
              {scanned === null ? 'Scan now' : 'Scan again'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#000',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  helpText: {
    color: '#fff',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: '#303940',
  },
  buttonText: {
    color: '#fff',
  },
});
