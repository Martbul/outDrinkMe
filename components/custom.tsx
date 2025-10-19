import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. PAGE CONTAINER
export const PageContainer = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <SafeAreaView className={`flex-1 bg-containerBg ${className}`}>
    {children}
  </SafeAreaView>
);

// 2. HEADER WITH GRADIENT BACKGROUND
export const GradientHeader = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View
    className={`flex flex-row items-center justify-end gap-3 px-4 pt-8 pb-9 bg-gradient-to-br from-panelDark to-panelDarker  ${className}`}
  >
    {children}
  </View>
);

// 3. HEADER BUTTON STYLE
export const HeaderButton = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    className="flex justify-center items-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
    onPress={onPress}
  >
    {children}
  </TouchableOpacity>
);

// 4. MAIN CARD STYLE (your white cards)
export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View
    className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ${className}`}
  >
    {children}
  </View>
);

// 5. CLICKABLE CARD (for navigation)
// FIXED CLICKABLE CARD COMPONENT
export const ClickableCard = ({
  onPress,
  children,
  className = "",
  arrowSize = 20,
  arrowBoxClassName = "",
}: {
  onPress: () => void;
  children: React.ReactNode;
  className?: string;
  arrowSize?: number;
  arrowBoxClassName?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.6}
    className={`flex flex-row justify-between items-center bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ${className}`}
  >
    {children}
    <View
      className={`w-10 h-10 bg-containerBg rounded-2xl flex items-center justify-center ${arrowBoxClassName} `}
    >
      <AntDesign name="arrow-right" size={arrowSize} color="#6B7280" />
    </View>
  </TouchableOpacity>
);

// 6. ICON CONTAINERS (different variants)
export const IconContainer = ({
  size = "medium",
  color = "accent",
  className = "",
  children,
}: {
  size?: "small" | "medium" | "large";
  color?:
    | "accent"
    | "green"
    | "green2"
    | "blue"
    | "neutral"
    | "red"
    | "gold"
    | "transparent";
  className?: string;
  children: React.ReactNode;
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-14 h-14",
  };

  const colorClasses = {
    accent: "bg-accent",
    green: "bg-iconGreen/10",
    green2: "bg-iconGreen/5",
    blue: "bg-sessionBlue/10",
    neutral: "bg-containerBg",
    red: "bg-red-600",
    gold: "bg-[#FFD700]/20",
    transparent: "bg-transparent",
  };

  return (
    <View
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-2xl flex items-center justify-center  ${className}`}
    >
      {children}
    </View>
  );
};

// 7. TEXT HIERARCHY
export const PageTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`text-textDark text-3xl font-bold mb-2 ${className}`}>
    {children}
  </Text>
);

export const SectionTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`text-textDark text-lg font-semibold mb-4 ${className}`}>
    {children}
  </Text>
);

export const CardTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`text-textDark text-lg font-semibold ${className}`}>
    {children}
  </Text>
);

export const BodyText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`text-textBlack text-lg font-medium ${className}`}>
    {children}
  </Text>
);

export const SecondaryText = ({ children }: { children: React.ReactNode }) => (
  <Text className="text-textDarkGray text-xl font-medium">{children}</Text>
);

export const MutedText = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text className={`text-textGray text-lg font-medium ${className} `}>
    {children}
  </Text>
);

// 8. CONTENT SPACING
export const SectionSpacing = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <View className={`"mb-6 ${className}`}>{children}</View>;

export const LargeSpacing = ({ children }: { children: React.ReactNode }) => (
  <View className="mb-8">{children}</View>
);

// 9. COMMON LAYOUTS
export const RowLayout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View className={`flex flex-row items-center ${className}`}>{children}</View>
);

export const SpaceBetweenRow = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <View className={`flex flex-row justify-between items-center ${className}`}>
    {children}
  </View>
);

export const CenteredColumn = ({ children }: { children: React.ReactNode }) => (
  <View className="flex flex-col items-center">{children}</View>
);

// 10. USAGE EXAMPLES
export const StyleGuideExample = () => (
  <PageContainer>
    <GradientHeader>
      <HeaderButton onPress={() => console.log("Settings")}>
        <Ionicons name="settings" size={28} color="#1F2937" />
      </HeaderButton>
    </GradientHeader>

    <View className="px-4 pt-6">
      <SectionSpacing>
        <PageTitle>Page Title</PageTitle>
        <RowLayout>
          <IconContainer size="small" color="accent">
            <Feather name="hash" size={16} color="white" />
          </IconContainer>
          <SecondaryText>@username</SecondaryText>
        </RowLayout>
      </SectionSpacing>

      <SectionSpacing>
        <Card>
          <SectionTitle>Card Section</SectionTitle>
          <RowLayout>
            <IconContainer size="large" color="neutral">
              <Ionicons name="person" size={20} color="#6B7280" />
            </IconContainer>
            <BodyText>Card content text</BodyText>
          </RowLayout>
        </Card>
      </SectionSpacing>

      <SectionSpacing>
        <ClickableCard onPress={() => console.log("Clicked")}>
          <RowLayout>
            <IconContainer color="green">
              <Ionicons name="people" size={20} color="#10B981" />
            </IconContainer>
            <CardTitle>Clickable Section</CardTitle>
          </RowLayout>
        </ClickableCard>
      </SectionSpacing>
    </View>
  </PageContainer>
);

// EXPORT COMMON STYLE CLASSES AS CONSTANTS
export const COMMON_STYLES = {
  // Containers
  PAGE_CONTAINER: "flex-1 bg-containerBg",
  GRADIENT_HEADER:
    "flex flex-row items-center justify-end gap-3 px-4 pt-8 pb-9 bg-gradient-to-br from-panelDark to-panelDarker",
  CARD: "bg-white rounded-3xl p-6 shadow-sm border border-gray-100",
  CLICKABLE_CARD:
    "flex flex-row justify-between items-center bg-white rounded-3xl p-6 shadow-sm border border-gray-100",

  // Buttons
  HEADER_BUTTON:
    "flex justify-center items-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20",
  ARROW_ICON_CONTAINER:
    "w-10 h-10 bg-containerBg rounded-2xl flex items-center justify-center",

  // Icon containers
  ICON_SMALL: "w-8 h-8 rounded-2xl flex items-center justify-center shadow-sm",
  ICON_MEDIUM:
    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
  ICON_LARGE:
    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",

  // Text styles
  PAGE_TITLE: "text-textDark text-4xl font-bold mb-2",
  SECTION_TITLE: "text-textDark text-lg font-semibold mb-4",
  CARD_TITLE: "text-textDark text-lg font-semibold",
  BODY_TEXT: "text-textBlack text-lg font-medium",
  SECONDARY_TEXT: "text-textDarkGray text-xl font-medium",
  MUTED_TEXT: "text-textGray text-lg font-medium",

  // Layouts
  ROW: "flex flex-row items-center",
  SPACE_BETWEEN_ROW: "flex flex-row justify-between items-center",
  CENTERED_COLUMN: "flex flex-col items-center",

  // Spacing
  SECTION_SPACING: "mb-6",
  LARGE_SPACING: "mb-8",
  CONTENT_PADDING: "px-4",
};
