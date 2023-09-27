import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Formik } from 'formik';
import * as yup from 'yup';

import { AuthContext } from '../context/AuthContext';

export default function AuthScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp } = useContext(AuthContext);

  const validationSchema = isLogin
    ? yup.object().shape({
        email: yup
          .string()
          .email('Email must be valid')
          .required("Email can't be empty"),
        password: yup.string().required("Password can't be empty"),
      })
    : yup.object().shape({
        email: yup
          .string()
          .email('Email must be valid')
          .required("Email can't be empty"),
        password: yup
          .string()
          .min(6, 'Password must be at least 6 characters')
          .required("Password can't be empty"),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref('password'), null], "Passwords don't match"),
      });

  let content;

  if (isLogin) {
    content = (
      <Formik
        initialValues={{
          email: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          setIsLoading(true);
          const result = await signIn({
            email: values.email,
            password: values.password,
          });
          setIsLoading(false);
          if (result.isError) {
            Alert.alert('Error', 'Invalid email or password');
          }
        }}
        validateOnChange={false}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <ScrollView
            style={styles.scrollViewContainer}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Log in</Text>
                <View style={styles.changeAuthContainer}>
                  <Text style={styles.questionText}>
                    Don't have an account yet?
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsLogin(false);
                    }}
                  >
                    <Text style={styles.changeAuthButtonText}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.subtitle}>Email</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Enter your email"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.subtitle}>Password</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholder="Enter your password"
                  secureTextEntry={true}
                />
                <Text style={styles.errorText}>{errors.password}</Text>
              </View>
              <TouchableHighlight
                onPress={isLoading ? null : handleSubmit}
                style={styles.buttonContainer}
              >
                <View style={styles.button}>
                  {isLoading ? (
                    <ActivityIndicator
                      style={{ marginHorizontal: 14, marginVertical: 2 }}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Log in</Text>
                  )}
                </View>
              </TouchableHighlight>
            </View>
          </ScrollView>
        )}
      </Formik>
    );
  }

  if (!isLogin) {
    content = (
      <Formik
        initialValues={{
          email: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          setIsLoading(true);
          const result = await signUp({
            email: values.email,
            password: values.password,
          });
          setIsLoading(false);
          if (result.isError) {
            Alert.alert('Error', 'Something went wrong');
          }
        }}
        validateOnChange={false}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
          <ScrollView
            style={styles.scrollViewContainer}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.innerContainer}>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Create account</Text>
                <View style={styles.changeAuthContainer}>
                  <Text style={styles.questionText}>Already have account?</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsLogin(true);
                    }}
                  >
                    <Text style={styles.changeAuthButtonText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.subtitle}>Email</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  placeholder="Enter your email"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <Text style={styles.errorText}>{errors.email}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.subtitle}>Password</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  placeholder="Enter your password"
                  secureTextEntry={true}
                />
                <Text style={styles.errorText}>{errors.password}</Text>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.subtitle}>Confirm password</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={true}
                />
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              </View>
              <TouchableHighlight
                onPress={isLoading ? null : handleSubmit}
                style={styles.buttonContainer}
              >
                <View style={styles.button}>
                  {isLoading ? (
                    <ActivityIndicator
                      style={{ marginHorizontal: 14, marginVertical: 2 }}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Sign up</Text>
                  )}
                </View>
              </TouchableHighlight>
            </View>
          </ScrollView>
        )}
      </Formik>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    alignItems: 'center',
  },
  input: {
    height: 60,
    fontSize: 18,
    backgroundColor: '#e8e8e8',
    borderRadius: 10,
    padding: 10,
  },
  inputContainer: {
    width: '85%',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 26,
    textAlign: 'center',
  },
  headerContainer: {
    justifyContent: 'center',
  },
  buttonContainer: {
    borderRadius: 10,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#167bff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  buttonDisabled: {
    backgroundColor: '#b8b8b8',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  changeAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 16,
    marginRight: 5,
  },
  changeAuthButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
