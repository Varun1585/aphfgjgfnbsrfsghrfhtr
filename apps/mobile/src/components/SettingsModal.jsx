import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  X, 
  Zap, 
  Volume2, 
  Smartphone, 
  Target, 
  AlertTriangle,
  Info,
  Trash2
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "./useColors";

export default function SettingsModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  // Settings state
  const [settings, setSettings] = useState({
    hapticFeedback: true,
    soundAlerts: false,
    autoSave: true,
    highPrecisionMode: true,
    calibrationTime: 3,
    measurementTime: 5,
  });

  // Load settings from AsyncStorage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("appSettings");
      if (savedSettings) {
        setSettings({ ...settings, ...JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleSettingChange = (key, value) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClose = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const handleClearData = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Clear All Data",
      "This will permanently delete all measurement history. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("measurements");
              if (settings.hapticFeedback) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
              }
              Alert.alert("Success", "All measurement data has been cleared.");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            }
          },
        },
      ]
    );
  };

  const SettingRow = ({ icon: IconComponent, title, subtitle, rightComponent, onPress }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.cardBackground,
        marginBottom: 1,
      }}
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={title}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.fieldFill,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <IconComponent size={20} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Poppins_500Medium",
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: colors.background,
          paddingTop: insets.top 
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.outline,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
            }}
          >
            Settings
          </Text>

          <TouchableOpacity
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.fieldFill,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={handleClose}
            accessibilityLabel="Close settings"
          >
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Measurement Settings */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textSecondary,
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              MEASUREMENT
            </Text>

            <SettingRow
              icon={Zap}
              title="High Precision Mode"
              subtitle="Use advanced filtering algorithms"
              rightComponent={
                <Switch
                  value={settings.highPrecisionMode}
                  onValueChange={(value) => handleSettingChange("highPrecisionMode", value)}
                  trackColor={{ false: colors.fieldFill, true: colors.primaryLight }}
                  thumbColor={settings.highPrecisionMode ? colors.primary : colors.textSecondary}
                />
              }
            />

            <SettingRow
              icon={Target}
              title="Auto-Save Results"
              subtitle="Automatically save measurements"
              rightComponent={
                <Switch
                  value={settings.autoSave}
                  onValueChange={(value) => handleSettingChange("autoSave", value)}
                  trackColor={{ false: colors.fieldFill, true: colors.primaryLight }}
                  thumbColor={settings.autoSave ? colors.primary : colors.textSecondary}
                />
              }
            />
          </View>

          {/* Interface Settings */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textSecondary,
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              INTERFACE
            </Text>

            <SettingRow
              icon={Smartphone}
              title="Haptic Feedback"
              subtitle="Vibrate on button presses"
              rightComponent={
                <Switch
                  value={settings.hapticFeedback}
                  onValueChange={(value) => handleSettingChange("hapticFeedback", value)}
                  trackColor={{ false: colors.fieldFill, true: colors.primaryLight }}
                  thumbColor={settings.hapticFeedback ? colors.primary : colors.textSecondary}
                />
              }
            />

            <SettingRow
              icon={Volume2}
              title="Sound Alerts"
              subtitle="Play sounds during measurement"
              rightComponent={
                <Switch
                  value={settings.soundAlerts}
                  onValueChange={(value) => handleSettingChange("soundAlerts", value)}
                  trackColor={{ false: colors.fieldFill, true: colors.primaryLight }}
                  thumbColor={settings.soundAlerts ? colors.primary : colors.textSecondary}
                />
              }
            />
          </View>

          {/* Data Management */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textSecondary,
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              DATA MANAGEMENT
            </Text>

            <SettingRow
              icon={Trash2}
              title="Clear All Data"
              subtitle="Delete all measurement history"
              rightComponent={
                <View
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.background,
                    }}
                  >
                    Clear
                  </Text>
                </View>
              }
              onPress={handleClearData}
            />
          </View>

          {/* About */}
          <View style={{ marginTop: 24, marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_600SemiBold",
                color: colors.textSecondary,
                paddingHorizontal: 20,
                paddingBottom: 8,
              }}
            >
              ABOUT
            </Text>

            <View
              style={{
                backgroundColor: colors.cardBackground,
                marginHorizontal: 20,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Target size={20} color={colors.background} />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Poppins_600SemiBold",
                      color: colors.text,
                    }}
                  >
                    Distance Tracker
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Poppins_400Regular",
                      color: colors.textSecondary,
                    }}
                  >
                    Version 1.0.0
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Poppins_400Regular",
                  color: colors.textSecondary,
                  lineHeight: 20,
                }}
              >
                High-precision accelerometer-based distance measurement using advanced filtering algorithms including Kalman filtering and Zero Velocity Update techniques.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}