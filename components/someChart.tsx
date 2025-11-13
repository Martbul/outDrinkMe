import React from "react";
import { View, Text, ScrollView } from "react-native";

// ============================================================================
// 1. CIRCULAR PROGRESS CHART - Shows each category as a circular progress ring
// ============================================================================
interface CircularProgressChartProps {
  data: any[];
  size?: number;
}

export const CircularProgressChart: React.FC<CircularProgressChartProps> = ({
  data,
  size = 120,
}) => {
  const allAlcoholTypes = [
    "beer",
    "whiskey",
    "wine",
    "vodka",
    "gin",
    "liqueur",
    "rum",
    "tequila",
    "rakiya",
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    allAlcoholTypes.forEach((type) => (counts[type] = 0));

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          counts[category]++;
        }
      });
    }
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const maxValue = Math.max(...Object.values(categoryCounts), 1);
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const colors = [
    "#EA580C",
    "#F97316",
    "#FB923C",
    "#FDBA74",
    "#FED7AA",
    "#FFEDD5",
    "#FFF7ED",
    "#7C2D12",
    "#9A3412",
  ];

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          CIRCULAR PROGRESS DISTRIBUTION
        </Text>

        <View className="flex-row flex-wrap justify-center">
          {allAlcoholTypes.map((type, index) => {
            const count = categoryCounts[type];
            const percentage = maxValue > 0 ? (count / maxValue) * 100 : 0;
            const circumference = 2 * Math.PI * 40;
            const strokeDashoffset =
              circumference - (percentage / 100) * circumference;

            return (
              <View key={type} className="items-center m-2">
                <View
                  style={{ width: size, height: size, position: "relative" }}
                >
                  {/* Background Circle */}
                  <View
                    style={{
                      position: "absolute",
                      width: size - 20,
                      height: size - 20,
                      borderRadius: (size - 20) / 2,
                      borderWidth: 8,
                      borderColor: "rgba(255, 255, 255, 0.05)",
                      top: 10,
                      left: 10,
                    }}
                  />

                  {/* Progress Circle - using multiple segments */}
                  {percentage > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        width: size - 20,
                        height: size - 20,
                        borderRadius: (size - 20) / 2,
                        borderWidth: 8,
                        borderColor: colors[index],
                        top: 10,
                        left: 10,
                        transform: [{ rotate: "-90deg" }],
                        borderTopColor:
                          percentage >= 25 ? colors[index] : "transparent",
                        borderRightColor:
                          percentage >= 50 ? colors[index] : "transparent",
                        borderBottomColor:
                          percentage >= 75 ? colors[index] : "transparent",
                        borderLeftColor:
                          percentage >= 100 || percentage < 25
                            ? colors[index]
                            : "transparent",
                      }}
                    />
                  )}

                  {/* Center Content */}
                  <View
                    style={{
                      position: "absolute",
                      width: size,
                      height: size,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors[index],
                        fontSize: 24,
                        fontWeight: "900",
                      }}
                    >
                      {count}
                    </Text>
                    <Text
                      style={{
                        color: "#9CA3AF",
                        fontSize: 10,
                        fontWeight: "600",
                      }}
                    >
                      {Math.round(percentage)}%
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-white text-xs font-bold mt-2 capitalize"
                  style={{ color: colors[index] }}
                >
                  {type}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="mt-4 pt-4 border-t border-white/[0.08]">
          <Text className="text-white/50 text-xs text-center">
            Total Collection: {total} items
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 2. HEAT MAP CHART - Grid showing intensity of collection per category
// ============================================================================
interface HeatMapChartProps {
  data: any[];
}

export const HeatMapChart: React.FC<HeatMapChartProps> = ({ data }) => {
  const allAlcoholTypes = [
    "beer",
    "whiskey",
    "wine",
    "vodka",
    "gin",
    "liqueur",
    "rum",
    "tequila",
    "rakiya",
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    allAlcoholTypes.forEach((type) => (counts[type] = 0));

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          counts[category]++;
        }
      });
    }
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const maxValue = Math.max(...Object.values(categoryCounts), 1);

  const getHeatColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return "rgba(255, 255, 255, 0.03)";
    if (intensity < 0.2) return "rgba(234, 88, 12, 0.2)";
    if (intensity < 0.4) return "rgba(234, 88, 12, 0.4)";
    if (intensity < 0.6) return "rgba(234, 88, 12, 0.6)";
    if (intensity < 0.8) return "rgba(234, 88, 12, 0.8)";
    return "rgba(234, 88, 12, 1)";
  };

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          COLLECTION HEAT MAP
        </Text>

        <View className="flex-row flex-wrap justify-center">
          {allAlcoholTypes.map((type) => {
            const count = categoryCounts[type];
            const intensity = count / maxValue;

            return (
              <View
                key={type}
                style={{
                  width: "30%",
                  margin: "1.5%",
                  aspectRatio: 1,
                  backgroundColor: getHeatColor(count),
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor:
                    count > 0 ? "#EA580C" : "rgba(255, 255, 255, 0.08)",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    color: intensity > 0.5 ? "#000" : "#FFF",
                    fontSize: 28,
                    fontWeight: "900",
                  }}
                >
                  {count}
                </Text>
                <Text
                  style={{
                    color:
                      intensity > 0.5
                        ? "rgba(0, 0, 0, 0.7)"
                        : "rgba(255, 255, 255, 0.7)",
                    fontSize: 10,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    textAlign: "center",
                    marginTop: 4,
                  }}
                  numberOfLines={1}
                >
                  {type}
                </Text>

                {/* Intensity Indicator */}
                <View className="flex-row mt-2 gap-1">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <View
                      key={bar}
                      style={{
                        width: 4,
                        height: 8,
                        backgroundColor:
                          bar <= intensity * 5
                            ? intensity > 0.5
                              ? "#000"
                              : "#FFF"
                            : "rgba(128, 128, 128, 0.3)",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View className="mt-6 pt-4 border-t border-white/[0.08]">
          <Text className="text-white/50 text-[10px] font-bold tracking-widest text-center mb-3">
            INTENSITY SCALE
          </Text>
          <View className="flex-row justify-center items-center gap-2">
            <Text className="text-white/50 text-xs">Low</Text>
            <View className="flex-row gap-1">
              {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
                <View
                  key={i}
                  style={{
                    width: 30,
                    height: 16,
                    backgroundColor: getHeatColor(intensity * maxValue),
                    borderRadius: 4,
                  }}
                />
              ))}
            </View>
            <Text className="text-white/50 text-xs">High</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 3. STACKED BAR CHART - Horizontal bars showing collection composition
// ============================================================================
interface StackedBarChartProps {
  data: any[];
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  const allAlcoholTypes = [
    "beer",
    "whiskey",
    "wine",
    "vodka",
    "gin",
    "liqueur",
    "rum",
    "tequila",
    "rakiya",
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    allAlcoholTypes.forEach((type) => (counts[type] = 0));

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          counts[category]++;
        }
      });
    }
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const colors = [
    "#EA580C",
    "#F97316",
    "#FB923C",
    "#FDBA74",
    "#FED7AA",
    "#DC2626",
    "#EF4444",
    "#F87171",
    "#FCA5A5",
  ];

  // Sort by count for better visualization
  const sortedTypes = allAlcoholTypes
    .map((type) => ({ type, count: categoryCounts[type] }))
    .sort((a, b) => b.count - a.count);

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          STACKED COLLECTION VIEW
        </Text>

        {/* Main Stacked Bar */}
        <View className="mb-6">
          <Text className="text-white text-sm font-bold mb-2">
            Total Collection Breakdown
          </Text>
          <View
            style={{
              height: 60,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 12,
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {sortedTypes.map(({ type, count }, index) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              if (count === 0) return null;

              return (
                <View
                  key={type}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[allAlcoholTypes.indexOf(type)],
                    justifyContent: "center",
                    alignItems: "center",
                    borderRightWidth: index < sortedTypes.length - 1 ? 2 : 0,
                    borderRightColor: "#000",
                  }}
                >
                  {percentage > 8 && (
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 14,
                        fontWeight: "900",
                      }}
                    >
                      {count}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Individual Category Bars */}
        <View>
          {sortedTypes.map(({ type, count }, index) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <View key={type} className="mb-3">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-white text-sm font-bold capitalize">
                    {type}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white/70 text-xs font-semibold">
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text className="text-white text-sm font-black">
                      {count}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    height: 24,
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      backgroundColor: colors[allAlcoholTypes.indexOf(type)],
                      borderRadius: 8,
                    }}
                  />

                  {/* Gradient overlay */}
                  <View
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${percentage}%`,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 8,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View className="mt-4 pt-4 border-t border-white/[0.08]">
          <Text className="text-white/50 text-xs text-center">
            Total: {total} items across{" "}
            {sortedTypes.filter((t) => t.count > 0).length} categories
          </Text>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 4. BUBBLE CHART - Size represents quantity, position shows relationship
// ============================================================================
interface BubbleChartProps {
  data: any[];
  size?: number;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  size = 350,
}) => {
  const allAlcoholTypes = [
    "beer",
    "whiskey",
    "wine",
    "vodka",
    "gin",
    "liqueur",
    "rum",
    "tequila",
    "rakiya",
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    allAlcoholTypes.forEach((type) => (counts[type] = 0));

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          counts[category]++;
        }
      });
    }
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const maxValue = Math.max(...Object.values(categoryCounts), 1);

  const colors = [
    "#EA580C",
    "#F97316",
    "#FB923C",
    "#FDBA74",
    "#FED7AA",
    "#DC2626",
    "#EF4444",
    "#F87171",
    "#FCA5A5",
  ];

  // Calculate bubble positions using a packed circle algorithm
  const bubbles = allAlcoholTypes.map((type, index) => {
    const count = categoryCounts[type];
    const radius = Math.max(
      count > 0 ? Math.sqrt(count / maxValue) * 60 : 20,
      20
    );

    // Arrange in a circular pattern
    const angle = (index * 2 * Math.PI) / allAlcoholTypes.length;
    const distance = size / 3;
    const x = size / 2 + Math.cos(angle) * distance - radius;
    const y = size / 2 + Math.sin(angle) * distance - radius;

    return { type, count, radius, x, y, color: colors[index] };
  });

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          BUBBLE DISTRIBUTION MAP
        </Text>

        <View
          style={{
            width: size,
            height: size,
            position: "relative",
            alignSelf: "center",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Center indicator */}
          <View
            style={{
              position: "absolute",
              left: size / 2 - 3,
              top: size / 2 - 3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#EA580C",
            }}
          />

          {bubbles.map((bubble) => (
            <View
              key={bubble.type}
              style={{
                position: "absolute",
                left: bubble.x,
                top: bubble.y,
                width: bubble.radius * 2,
                height: bubble.radius * 2,
                borderRadius: bubble.radius,
                backgroundColor: bubble.color,
                opacity: bubble.count > 0 ? 0.8 : 0.2,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor:
                  bubble.count > 0 ? "#FFF" : "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: Math.max(bubble.radius / 3, 12),
                  fontWeight: "900",
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {bubble.count}
              </Text>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: Math.max(bubble.radius / 6, 8),
                  fontWeight: "700",
                  textTransform: "uppercase",
                  textAlign: "center",
                  textShadowColor: "rgba(0, 0, 0, 0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
                numberOfLines={1}
              >
                {bubble.type.substring(0, 5)}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6">
          <Text className="text-white/50 text-[10px] font-bold tracking-widest text-center mb-3">
            BUBBLE SIZE = COLLECTION SIZE
          </Text>
          <View className="flex-row flex-wrap justify-center gap-2">
            {bubbles
              .filter((b) => b.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((bubble) => (
                <View
                  key={bubble.type}
                  className="flex-row items-center gap-2 px-3 py-1 rounded-lg"
                  style={{
                    backgroundColor: bubble.color + "20",
                    borderWidth: 1,
                    borderColor: bubble.color + "40",
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: bubble.color,
                    }}
                  />
                  <Text className="text-white text-xs font-semibold capitalize">
                    {bubble.type}: {bubble.count}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// 5. WATERFALL CHART - Shows cumulative progression of collection
// ============================================================================
interface WaterfallChartProps {
  data: any[];
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ data }) => {
  const allAlcoholTypes = [
    "beer",
    "whiskey",
    "wine",
    "vodka",
    "gin",
    "liqueur",
    "rum",
    "tequila",
    "rakiya",
  ];

  const getCategoryCounts = () => {
    const counts: Record<string, number> = {};
    allAlcoholTypes.forEach((type) => (counts[type] = 0));

    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          counts[category]++;
        }
      });
    }
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  // Sort by count for waterfall effect
  const sortedTypes = allAlcoholTypes
    .map((type) => ({ type, count: categoryCounts[type] }))
    .sort((a, b) => b.count - a.count);

  const total = sortedTypes.reduce((sum, item) => sum + item.count, 0);
  const maxHeight = 200;

  // Calculate cumulative positions
  let cumulative = 0;
  const waterfallData = sortedTypes.map((item) => {
    const startY = cumulative;
    cumulative += item.count;
    const height = maxHeight * (item.count / total);
    return {
      ...item,
      startY: maxHeight - (startY / total) * maxHeight - height,
      height: height || 2, // Minimum height for visibility
    };
  });

  const colors = [
    "#EA580C",
    "#F97316",
    "#FB923C",
    "#FDBA74",
    "#FED7AA",
    "#DC2626",
    "#EF4444",
    "#F87171",
    "#FCA5A5",
  ];

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          WATERFALL CUMULATIVE VIEW
        </Text>

        <View className="mb-6">
          <View className="flex-row" style={{ height: maxHeight + 40 }}>
            {/* Y-axis labels */}
            <View className="justify-between mr-2 py-5" style={{ width: 30 }}>
              <Text className="text-white/50 text-xs text-right">{total}</Text>
              <Text className="text-white/50 text-xs text-right">
                {Math.round(total * 0.5)}
              </Text>
              <Text className="text-white/50 text-xs text-right">0</Text>
            </View>

            {/* Waterfall bars */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              <View
                className="flex-row items-end pb-5"
                style={{ height: maxHeight + 40 }}
              >
                {waterfallData.map((item, index) => {
                  const barColor = colors[allAlcoholTypes.indexOf(item.type)];

                  return (
                    <View
                      key={item.type}
                      className="mx-1"
                      style={{ width: 70 }}
                    >
                      <View
                        style={{
                          height: maxHeight,
                          justifyContent: "flex-end",
                        }}
                      >
                        {/* Connector line to previous bar */}
                        {index > 0 && (
                          <View
                            style={{
                              position: "absolute",
                              top: item.startY,
                              left: -8,
                              width: 16,
                              height: 1,
                              backgroundColor: "#9CA3AF",
                              opacity: 0.3,
                            }}
                          />
                        )}

                        {/* Main bar */}
                        <View
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: maxHeight - item.startY,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            borderRadius: 8,
                          }}
                        />

                        <View
                          style={{
                            height: item.height,
                            backgroundColor: barColor,
                            borderRadius: 8,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 2,
                            borderColor: "#FFF",
                            marginBottom: maxHeight - item.startY - item.height,
                          }}
                        >
                          {item.height > 20 && (
                            <Text
                              style={{
                                color: "#FFF",
                                fontSize: 14,
                                fontWeight: "900",
                              }}
                            >
                              {item.count}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Label */}
                      <Text
                        className="text-white text-xs font-bold text-center mt-2 capitalize"
                        numberOfLines={1}
                      >
                        {item.type}
                      </Text>

                      {/* Count if bar too small */}
                      {item.height <= 20 && item.count > 0 && (
                        <Text className="text-orange-600 text-xs font-black text-center">
                          {item.count}
                        </Text>
                      )}
                    </View>
                  );
                })}

                {/* Total bar */}
                <View className="mx-2" style={{ width: 70 }}>
                  <View
                    style={{ height: maxHeight, justifyContent: "flex-end" }}
                  >
                    <View
                      style={{
                        height: maxHeight,
                        backgroundColor: "rgba(234, 88, 12, 0.3)",
                        borderRadius: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#EA580C",
                        borderStyle: "dashed",
                      }}
                    >
                      <Text className="text-orange-600 text-xl font-black">
                        {total}
                      </Text>
                      <Text className="text-white/70 text-xs font-bold">
                        TOTAL
                      </Text>
                    </View>
                  </View>
                  <Text className="text-orange-600 text-xs font-bold text-center mt-2">
                    Total
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        <View className="mt-4 pt-4 border-t border-white/[0.08]">
          <Text className="text-white/50 text-xs text-center mb-2">
            Cumulative Collection Growth
          </Text>
          <View className="flex-row justify-center gap-4">
            <View className="items-center">
              <Text className="text-orange-600 text-lg font-black">
                {total}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold">TOTAL</Text>
            </View>
            <View className="items-center">
              <Text className="text-orange-600 text-lg font-black">
                {sortedTypes.filter((t) => t.count > 0).length}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold">
                CATEGORIES
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-orange-600 text-lg font-black">
                {sortedTypes[0]?.count || 0}
              </Text>
              <Text className="text-white/50 text-[10px] font-bold">
                TOP ITEM
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
