import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  X, 
  Activity, 
  BarChart3, 
  Settings, 
  Share, 
  Info, 
  Zap,
  Target,
  Database
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "./useColors";
import { useRouter } from "expo-router";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default function MenuModal({ visible, onClose }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(-screenWidth * 0.8)).current;
  const overlayAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -screenWidth * 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleMenuItemPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    
    setTimeout(() => {
      switch (action) {
        case 'measure':
          router.push('/(tabs)/');
          break;
        case 'results':
          router.push('/(tabs)/results');
          break;
        case 'settings':
          // TODO: Navigate to settings screen
          break;
        case 'about':
          // TODO: Show about modal
          break;
        case 'share':
          // TODO: Share app functionality
          break;
        default:
          break;
      }
    }, 100);
  };

  const menuItems = [
    {
      id: 'measure',
      title: 'Distance Measurement',
      subtitle: 'Start new measurement',
      icon: Activity,
      color: colors.primary,
    },
    {
      id: 'results',
      title: 'Results History',
      subtitle: 'View past measurements',
      icon: BarChart3,
      color: colors.success,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App configuration',
      icon: Settings,
      color: colors.textSecondary,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App information',
      icon: Info,
      color: colors.textSecondary,
    },
    {
      id: 'share',
      title: 'Share App',
      subtitle: 'Tell others about this app',
      icon: Share,
      color: colors.textSecondary,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        {/* Background Overlay */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              opacity: overlayAnim,
            }}
          />
        </TouchableWithoutFeedback>

        {/* Menu Panel */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: screenWidth * 0.8,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            shadowColor: "#000",
            shadowOffset: {
              width: 2,
              height: 0,
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingTop: insets.top + 20,
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.outline,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Poppins_600SemiBold",
                  color: colors.text,
                }}
              >
                Menu
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
                accessibilityLabel="Close menu"
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* App Title */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                  High-precision measurement
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View style={{ flex: 1, paddingTop: 8 }}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                  onPress={() => handleMenuItemPress(item.id)}
                  accessibilityLabel={item.title}
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
                    <IconComponent size={20} color={item.color} />
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
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Poppins_400Regular",
                        color: colors.textSecondary,
                      }}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + 20,
              borderTopWidth: 1,
              borderTopColor: colors.outline,
            }}
          >
            <View
              style={{
                backgroundColor: colors.accentLilac,
                borderRadius: 12,
                padding: 16,
                marginTop: 20,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Zap size={16} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Poppins_600SemiBold",
                    color: colors.primary,
                    marginLeft: 8,
                  }}
                >
                  High Precision Mode
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Poppins_400Regular",
                  color: colors.primary,
                  marginTop: 4,
                  opacity: 0.8,
                }}
              >
                Utilizing advanced filtering for ±1cm accuracy
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}