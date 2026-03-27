import React from "react";
import { Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const C = useColors();

  return (
    <>
      <Stack.Screen
        options={{
          title: "LivDaily",
        }}
      />
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <Text style={[styles.title, { color: C.text }]}>
          LivDaily
        </Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>
          Your app is currently building...
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
});
