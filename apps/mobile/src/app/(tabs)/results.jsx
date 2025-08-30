import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  Trash2,
  Share,
  BarChart3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/components/useColors";
import Header from "@/components/Header";
import MenuModal from "@/components/MenuModal";
import SettingsModal from "@/components/SettingsModal";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load measurements from AsyncStorage
  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const data = await AsyncStorage.getItem("measurements");
      if (data) {
        setMeasurements(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll to show/hide header border
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 10);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeasurements();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const handleDeleteMeasurement = async (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Delete Measurement",
      "Are you sure you want to delete this measurement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedMeasurements = measurements.filter(
                (m) => m.id !== id,
              );
              setMeasurements(updatedMeasurements);
              await AsyncStorage.setItem(
                "measurements",
                JSON.stringify(updatedMeasurements),
              );
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (error) {
              console.error("Error deleting measurement:", error);
            }
          },
        },
      ],
    );
  };

  const handleShareMeasurement = (measurement) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement share functionality
    console.log("Share measurement:", measurement);
  };

  const getAccuracyColor = (accuracy) => {
    switch (accuracy) {
      case "±1cm":
        return colors.success;
      case "±5cm":
        return colors.warning;
      case "±10cm":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case "forward":
        return <TrendingUp size={16} color={colors.success} />;
      case "backward":
        return <TrendingDown size={16} color={colors.error} />;
      default:
        return <Minus size={16} color={colors.textSecondary} />;
    }
  };

  const getAverageDistance = () => {
    if (measurements.length === 0) return 0;
    const sum = measurements.reduce((acc, m) => acc + m.distance, 0);
    return sum / measurements.length;
  };

  const getHighAccuracyCount = () => {
    return measurements.filter((m) => m.accuracy === "±1cm").length;
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Fixed Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <Header
          title="Measurement Results"
          showBorder={showHeaderBorder}
          onMenuPress={handleMenuPress}
          onSettingsPress={handleSettingsPress}
          rightComponent={
            <View
              style={{
                height: 32,
                backgroundColor: colors.accentLilac,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
              }}
            >
              <BarChart3 size={16} color={colors.primary} />
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.primary,
                  marginLeft: 4,
                }}
              >
                {measurements.length}
              </Text>
            </View>
          }
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 20 + 40 + 20, // Header height + spacing
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Statistics Cards */}
        {measurements.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              marginBottom: 24,
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardStroke,
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                Avg Distance
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                {getAverageDistance().toFixed(1)}cm
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.cardStroke,
                borderRadius: 16,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_500Medium",
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                High Accuracy
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.success,
                }}
              >
                {getHighAccuracyCount()}/{measurements.length}
              </Text>
            </View>
          </View>
        )}

        {/* Measurements List */}
        {loading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              paddingBottom: 120,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
              }}
            >
              Loading measurements...
            </Text>
          </View>
        ) : measurements.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 80,
              paddingBottom: 120,
            }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: colors.accentLilac,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <BarChart3 size={48} color={colors.primary} />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No measurements yet
            </Text>

            <Text
              style={{
                fontSize: 15,
                fontFamily: "Poppins_400Regular",
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Your measurement results will appear here
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {measurements.map((measurement, index) => (
              <View
                key={measurement.id}
                style={{
                  backgroundColor: colors.cardBackground,
                  borderWidth: 1,
                  borderColor: colors.cardStroke,
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                {/* Header Row */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.primaryUltraLight,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Target size={20} color={colors.primary} />
                    </View>

                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "Poppins_600SemiBold",
                          color: colors.text,
                        }}
                      >
                        {measurement.distance.toFixed(1)} cm
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {getDirectionIcon(measurement.direction)}
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: "Poppins_400Regular",
                            color: colors.textSecondary,
                            marginLeft: 4,
                          }}
                        >
                          X-axis displacement
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <View
                      style={{
                        backgroundColor: getAccuracyColor(measurement.accuracy),
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: "Poppins_600SemiBold",
                          color: colors.background,
                        }}
                      >
                        {measurement.accuracy}
                      </Text>
                    </View>

                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_400Regular",
                        color: colors.textSecondary,
                      }}
                    >
                      {formatTime(measurement.timestamp)}
                    </Text>
                  </View>
                </View>

                {/* Details Row */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: colors.outline,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Poppins_400Regular",
                        color: colors.textSecondary,
                        marginLeft: 6,
                      }}
                    >
                      {measurement.duration}s duration
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.fieldFill,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => handleShareMeasurement(measurement)}
                      accessibilityLabel="Share measurement"
                    >
                      <Share size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.fieldFill,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => handleDeleteMeasurement(measurement.id)}
                      accessibilityLabel="Delete measurement"
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <MenuModal
        visible={showMenuModal}
        onClose={() => setShowMenuModal(false)}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </View>
  );
}
