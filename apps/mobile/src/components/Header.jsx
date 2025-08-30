import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Menu, Settings } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "./useColors";

export default function Header({ 
  title, 
  showBorder = false, 
  onMenuPress,
  onSettingsPress,
  rightComponent
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onMenuPress) {
      onMenuPress();
    }
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSettingsPress) {
      onSettingsPress();
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderBottomWidth: showBorder ? 1 : 0,
        borderBottomColor: colors.outline,
      }}
    >
      {/* Navigation Row */}
      <View
        style={{
          height: insets.top + 56,
          paddingTop: insets.top,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.outline,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleMenuPress}
          accessibilityLabel="Open menu"
        >
          <Menu size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.outline,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleSettingsPress}
          accessibilityLabel="Settings"
        >
          <Settings size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Title and Right Component Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontFamily: "Poppins_600SemiBold",
            color: colors.text,
          }}
        >
          {title}
        </Text>

        {rightComponent}
      </View>
    </View>
  );
}