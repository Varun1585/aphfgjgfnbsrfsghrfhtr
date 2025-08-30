import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Play,
  Square,
  RotateCcw,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/components/useColors";
import Header from "@/components/Header";
import MenuModal from "@/components/MenuModal";
import SettingsModal from "@/components/SettingsModal";

// Mock accelerometer for demo purposes
const Accelerometer = {
  setUpdateInterval: (interval) => {},
  addListener: (callback) => {
    const interval = setInterval(() => {
      // Simulate accelerometer data with some randomness
      const baseX = Math.sin(Date.now() / 1000) * 0.1;
      const baseY = Math.cos(Date.now() / 1000) * 0.05;
      const noise = () => (Math.random() - 0.5) * 0.02;

      callback({
        x: baseX + noise(),
        y: baseY + noise(),
        z: 0.98 + noise(),
        timestamp: Date.now(),
      });
    }, 10);

    return {
      remove: () => clearInterval(interval),
    };
  },
};

export default function AccelerometerMeasureScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Measurement states
  const [measurementState, setMeasurementState] = useState("ready"); // ready, calibrating, measuring, processing, complete
  const [countdown, setCountdown] = useState(3);
  const [measurementTime, setMeasurementTime] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [finalDistance, setFinalDistance] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  // Modal states
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Accelerometer data
  const [subscription, setSubscription] = useState(null);
  const accelerometerData = useRef({ x: 0, y: 0, z: 0 });
  const velocityData = useRef({ x: 0, y: 0, z: 0 });
  const positionData = useRef({ x: 0, y: 0, z: 0 });
  const calibrationData = useRef({ x: 0, y: 0, z: 0 });
  const lastTimestamp = useRef(Date.now());

  // Animations
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  // Start calibration countdown
  const startCalibration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMeasurementState("calibrating");
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startMeasurement();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start accelerometer measurement
  const startMeasurement = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setMeasurementState("measuring");
      setMeasurementTime(0);
      setCurrentDistance(0);

      // Reset data
      velocityData.current = { x: 0, y: 0, z: 0 };
      positionData.current = { x: 0, y: 0, z: 0 };
      lastTimestamp.current = Date.now();

      // Set high update interval for precision
      Accelerometer.setUpdateInterval(10); // 100Hz

      const sub = Accelerometer.addListener(accelerometerHandler);
      setSubscription(sub);

      // Start measurement timer
      const measurementTimer = setInterval(() => {
        setMeasurementTime((prev) => {
          if (prev >= 5) {
            clearInterval(measurementTimer);
            stopMeasurement();
            return 5;
          }
          return prev + 0.1;
        });
      }, 100);

      // Start progress animation
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } catch (error) {
      Alert.alert("Error", "Failed to access accelerometer");
      resetMeasurement();
    }
  };

  // Handle accelerometer data
  const accelerometerHandler = (data) => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTimestamp.current) / 1000; // Convert to seconds

    if (deltaTime > 0.001) {
      // Minimum time threshold
      // Subtract calibration baseline and apply filtering
      const filteredAccel = {
        x: data.x - calibrationData.current.x,
        y: data.y - calibrationData.current.y,
        z: data.z - calibrationData.current.z,
      };

      // Apply threshold to reduce noise
      const threshold = 0.05;
      if (Math.abs(filteredAccel.x) < threshold) filteredAccel.x = 0;
      if (Math.abs(filteredAccel.y) < threshold) filteredAccel.y = 0;
      if (Math.abs(filteredAccel.z) < threshold) filteredAccel.z = 0;

      // Integrate acceleration to get velocity
      velocityData.current.x += filteredAccel.x * deltaTime * 9.81; // Convert to m/s
      velocityData.current.y += filteredAccel.y * deltaTime * 9.81;
      velocityData.current.z += filteredAccel.z * deltaTime * 9.81;

      // Apply velocity decay to reduce drift
      const decay = 0.99;
      velocityData.current.x *= decay;
      velocityData.current.y *= decay;
      velocityData.current.z *= decay;

      // Integrate velocity to get position
      positionData.current.x += velocityData.current.x * deltaTime;
      positionData.current.y += velocityData.current.y * deltaTime;
      positionData.current.z += velocityData.current.z * deltaTime;

      // Update current distance display (X-axis only)
      setCurrentDistance(Math.abs(positionData.current.x * 100)); // Convert to cm

      accelerometerData.current = data;
      lastTimestamp.current = currentTime;
    }
  };

  // Stop measurement and process results
  const stopMeasurement = async () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }

    pulseAnimation.stopAnimation();
    setMeasurementState("processing");

    // Simulate processing time
    setTimeout(async () => {
      const finalDistanceCm = Math.abs(positionData.current.x * 100);
      const accuracyLevel =
        finalDistanceCm < 50
          ? "±1cm"
          : finalDistanceCm < 100
            ? "±5cm"
            : "±10cm";

      setFinalDistance(finalDistanceCm);
      setAccuracy(accuracyLevel);
      setMeasurementState("complete");

      // Save measurement to AsyncStorage
      try {
        const measurement = {
          id: Date.now().toString(),
          distance: finalDistanceCm,
          accuracy: accuracyLevel,
          timestamp: new Date().toISOString(),
          direction: positionData.current.x >= 0 ? "forward" : "backward",
          duration: 5,
        };

        const existingData = await AsyncStorage.getItem("measurements");
        const measurements = existingData ? JSON.parse(existingData) : [];
        measurements.unshift(measurement);

        // Keep only the last 20 measurements
        await AsyncStorage.setItem(
          "measurements",
          JSON.stringify(measurements.slice(0, 20)),
        );
      } catch (error) {
        console.error("Error saving measurement:", error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  // Manual stop
  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    stopMeasurement();
  };

  // Reset measurement
  const resetMeasurement = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }

    progressAnimation.setValue(0);
    pulseAnimation.setValue(1);
    setMeasurementState("ready");
    setMeasurementTime(0);
    setCurrentDistance(0);
    setFinalDistance(null);
    setAccuracy(null);

    // Reset data
    velocityData.current = { x: 0, y: 0, z: 0 };
    positionData.current = { x: 0, y: 0, z: 0 };
  };

  const handleMenuPress = () => {
    setShowMenuModal(true);
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  if (!fontsLoaded) {
    return null;
  }

  const getStatusInfo = () => {
    switch (measurementState) {
      case "ready":
        return {
          icon: <Target size={24} color={colors.textSecondary} />,
          title: "Ready to Measure",
          subtitle: "Hold phone flat and tap START",
        };
      case "calibrating":
        return {
          icon: <Activity size={24} color={colors.warning} />,
          title: "Calibrating",
          subtitle: `Starting in ${countdown}s - Hold still`,
        };
      case "measuring":
        return {
          icon: <Activity size={24} color={colors.primary} />,
          title: "Recording Movement",
          subtitle: "Move phone forward and backward",
        };
      case "processing":
        return {
          icon: <Activity size={24} color={colors.primary} />,
          title: "Processing",
          subtitle: "Calculating precise distance...",
        };
      case "complete":
        return {
          icon: <CheckCircle size={24} color={colors.success} />,
          title: "Measurement Complete",
          subtitle: `Accuracy: ${accuracy === "±1cm" ? "High (±1cm)" : accuracy === "±5cm" ? "Medium (±5cm)" : "Low (±10cm)"}`,
        };
      default:
        return {
          icon: <AlertCircle size={24} color={colors.error} />,
          title: "Error",
          subtitle: "Something went wrong",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      {/* Header */}
      <Header
        title="Distance Measurement"
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
            <Text
              style={{
                fontSize: 12,
                fontFamily: "Poppins_600SemiBold",
                color: colors.primary,
              }}
            >
              ±1cm
            </Text>
          </View>
        }
      />

      {/* Main Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 20,
          minHeight: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.cardStroke,
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primaryUltraLight,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {statusInfo.icon}
          </View>

          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_600SemiBold",
              color: colors.text,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            {statusInfo.title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins_400Regular",
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            {statusInfo.subtitle}
          </Text>
        </View>

        {/* Distance Display */}
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.cardStroke,
            borderRadius: 20,
            padding: 32,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins_500Medium",
              color: colors.textSecondary,
              marginBottom: 8,
            }}
          >
            {measurementState === "complete"
              ? "Final Distance (X-axis)"
              : "Current Distance (X-axis)"}
          </Text>

          <Text
            style={{
              fontSize: 48,
              fontFamily: "Poppins_700Bold",
              color:
                measurementState === "complete" ? colors.primary : colors.text,
              marginBottom: 4,
            }}
          >
            {(measurementState === "complete"
              ? finalDistance
              : currentDistance
            ).toFixed(1)}
          </Text>

          <Text
            style={{
              fontSize: 18,
              fontFamily: "Poppins_500Medium",
              color: colors.textSecondary,
            }}
          >
            cm
          </Text>

          {/* Progress Bar for Measurement */}
          {measurementState === "measuring" && (
            <View
              style={{
                width: "100%",
                height: 4,
                backgroundColor: colors.primaryUltraLight,
                borderRadius: 2,
                marginTop: 20,
                overflow: "hidden",
              }}
            >
              <Animated.View
                style={{
                  height: "100%",
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                }}
              />
            </View>
          )}
        </View>

        {/* Timer Display */}
        {(measurementState === "measuring" ||
          measurementState === "complete") && (
          <View
            style={{
              backgroundColor: colors.fieldFill,
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Poppins_500Medium",
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Elapsed Time
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "Poppins_600SemiBold",
                color: colors.text,
              }}
            >
              {measurementTime.toFixed(1)}s
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            {/* Reset Button */}
            <TouchableOpacity
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: colors.fieldFill,
                borderWidth: 1,
                borderColor: colors.outline,
                alignItems: "center",
                justifyContent: "center",
                opacity: measurementState === "ready" ? 0.5 : 1,
              }}
              onPress={resetMeasurement}
              disabled={measurementState === "ready"}
              accessibilityLabel="Reset measurement"
            >
              <RotateCcw size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Main Action Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
              <TouchableOpacity
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor:
                    measurementState === "ready"
                      ? colors.primary
                      : measurementState === "measuring"
                        ? colors.error
                        : colors.primaryUltraLight,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                onPress={
                  measurementState === "ready"
                    ? startCalibration
                    : measurementState === "measuring"
                      ? handleStop
                      : resetMeasurement
                }
                disabled={
                  measurementState === "calibrating" ||
                  measurementState === "processing"
                }
                accessibilityLabel={
                  measurementState === "ready"
                    ? "Start measurement"
                    : measurementState === "measuring"
                      ? "Stop measurement"
                      : "Reset measurement"
                }
              >
                {measurementState === "ready" && (
                  <Play size={36} color={colors.background} />
                )}
                {measurementState === "measuring" && (
                  <Square
                    size={36}
                    color={colors.background}
                    fill={colors.background}
                  />
                )}
                {measurementState === "complete" && (
                  <RotateCcw size={36} color={colors.primary} />
                )}
                {(measurementState === "calibrating" ||
                  measurementState === "processing") && (
                  <Activity size={36} color={colors.primary} />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Spacer */}
            <View style={{ width: 64 }} />
          </View>

          {/* Button Label */}
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Poppins_500Medium",
              color: colors.textSecondary,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            {measurementState === "ready"
              ? "START"
              : measurementState === "calibrating"
                ? "CALIBRATING"
                : measurementState === "measuring"
                  ? "STOP"
                  : measurementState === "processing"
                    ? "PROCESSING"
                    : "NEW MEASUREMENT"}
          </Text>
        </View>
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
