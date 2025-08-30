import { Tabs } from "expo-router";
import { Activity, BarChart3 } from "lucide-react-native";
import { useColors } from "@/components/useColors";

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderColor: colors.outline,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins_400Regular",
        },
        tabBarIconStyle: {
          marginBottom: -3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Measure",
          tabBarIcon: ({ color, size }) => <Activity color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Results",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}