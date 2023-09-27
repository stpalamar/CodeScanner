import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useReducer, useEffect, useMemo } from 'react';

import ScannerScreen from './src/screens/ScannerScreen';
import AuthScreen from './src/screens/AuthScreen';
import StorageScreen from './src/screens/StorageScreen';
import SplashScreen from './src/screens/SplashScreen';

import { AuthContext } from './src/context/AuthContext';

import { app } from './src/config/firebaseConfig';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

const Stack = createNativeStackNavigator();

export default function App() {
  const auth = getAuth(app);
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_USER':
          return {
            ...prevState,
            user: action.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            isLoading: false,
            user: action.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            isLoading: false,
            user: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            dispatch({ type: 'RESTORE_USER', user: user });
          } else {
            dispatch({ type: 'SIGN_OUT', user: null });
          }
        });
      } catch (e) {
        console.log(e);
      }
    };
    bootstrapAsync();
  }, []);

  const authContext = useMemo(() => ({
    signIn: async (data) => {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        dispatch({ type: 'SIGN_IN', user: userCredential.user });
      } catch (error) {
        console.log('Error signing in: ' + error);
        return {
          isError: true,
          error: error,
        };
      }
    },
    signOut: async () => {
      try {
        await signOut(auth);
        dispatch({ type: 'SIGN_OUT' });
      } catch (error) {
        console.log('Error signing out: ' + error);
      }
    },
    signUp: async (data) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );
        dispatch({ type: 'SIGN_IN', user: userCredential.user });
      } catch (error) {
        console.log('Error signing up: ' + error);
        return {
          isError: true,
          error: error,
        };
      }
    },
    uid: state.user?.uid,
  }));

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator>
          {state.isLoading ? (
            <Stack.Screen
              name="SplashScreen"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
          ) : state.user == null ? (
            <Stack.Screen
              name="AuthScreen"
              component={AuthScreen}
              options={{
                headerShown: false,
              }}
            />
          ) : (
            <Stack.Screen
              name="ScannerScreen"
              component={ScannerScreen}
              options={{
                title: 'Scan QR Code',
                headerStyle: {
                  backgroundColor: '#000',
                },
                headerTintColor: '#fff',
              }}
            />
          )}
          <Stack.Screen
            name="StorageScreen"
            component={StorageScreen}
            options={{
              title: 'Saved Codes',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
  },
};
