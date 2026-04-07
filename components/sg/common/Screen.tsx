import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

function useBottomTabBarHeightSafe(): number {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}

export default function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const tabBarHeight = useBottomTabBarHeightSafe();
  const insets = useSafeAreaInsets();

  if (!scroll) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100">{children}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-gray-100"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: tabBarHeight + 16,
        }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}