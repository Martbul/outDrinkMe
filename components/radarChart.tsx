import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CategoryData {
  category: string;
  count: number;
}

interface CategoryRadarChartProps {
  data: any[];
  size?: number;
}

export const CategoryRadarChart: React.FC<CategoryRadarChartProps> = ({
  data,
  size = 320,
}) => {
  // All alcohol types - always show these
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

  // Process the raw data to get category counts
  const getCategoryBreakdown = (): CategoryData[] => {
    // Count items by type
    const categoryCounts: Record<string, number> = {};

    // Initialize all alcohol types with 0
    allAlcoholTypes.forEach((type) => {
      categoryCounts[type] = 0;
    });

    // Count actual items
    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const category = (item.type || item.category || "").toLowerCase();
        if (allAlcoholTypes.includes(category)) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
    }

    // Return all types in order with counts
    return allAlcoholTypes.map((category) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count: categoryCounts[category] || 0,
    }));
  };

  const categoryData = getCategoryBreakdown();
  const center = size / 2;
  const maxRadius = center - 60;
  const maxValue = Math.max(...categoryData.map((d) => d.count), 1);
  const numCategories = categoryData.length;
  const totalItems = categoryData.reduce((sum, item) => sum + item.count, 0);

  // Calculate positions for data points
  const dataPoints = categoryData.map((item, i) => {
    const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
    const radius = (item.count / maxValue) * maxRadius;
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return { x, y, angle, fullRadius: maxRadius };
  });

  // Calculate label positions
  const labels = categoryData.map((item, i) => {
    const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
    const labelRadius = maxRadius + 35;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    return { x, y, text: item.category };
  });

  // Create grid circles positions
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1].map((scale) => {
    const points = [];
    for (let i = 0; i < numCategories; i++) {
      const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
      const radius = maxRadius * scale;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      points.push({ x, y });
    }
    return points;
  });

  // Create axis lines
  const axisLines = categoryData.map((_, i) => {
    const angle = (i * 2 * Math.PI) / numCategories - Math.PI / 2;
    const x2 = center + Math.cos(angle) * maxRadius;
    const y2 = center + Math.sin(angle) * maxRadius;
    return { x1: center, y1: center, x2, y2 };
  });

  return (
    <View className="px-4 mb-4">
      <View className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.08]">
        <Text className="text-white/50 text-[11px] font-bold tracking-widest mb-4">
          CATEGORY DISTRIBUTION
        </Text>

        {/* Radar Chart Container */}
        <View style={{ alignItems: "center" }}>
          <View style={{ width: size, height: size, position: "relative" }}>
            {/* Grid Circles */}
            {gridCircles.map((circle, circleIndex) => (
              <View
                key={`grid-${circleIndex}`}
                style={{ position: "absolute" }}
              >
                {circle.map((point, i) => {
                  const nextPoint = circle[(i + 1) % circle.length];
                  const length = Math.sqrt(
                    Math.pow(nextPoint.x - point.x, 2) +
                      Math.pow(nextPoint.y - point.y, 2)
                  );
                  const angle = Math.atan2(
                    nextPoint.y - point.y,
                    nextPoint.x - point.x
                  );

                  return (
                    <View
                      key={`grid-line-${circleIndex}-${i}`}
                      style={{
                        position: "absolute",
                        left: point.x,
                        top: point.y,
                        width: length,
                        height: 1,
                        backgroundColor: "#374151",
                        opacity: 0.3,
                        transform: [{ rotate: `${angle}rad` }],
                        transformOrigin: "left center",
                      }}
                    />
                  );
                })}
              </View>
            ))}

            {/* Axis Lines */}
            {axisLines.map((line, i) => {
              const length = Math.sqrt(
                Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2)
              );
              const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);

              return (
                <View
                  key={`axis-${i}`}
                  style={{
                    position: "absolute",
                    left: line.x1,
                    top: line.y1,
                    width: length,
                    height: 1,
                    backgroundColor: "#374151",
                    opacity: 0.3,
                    transform: [{ rotate: `${angle}rad` }],
                    transformOrigin: "left center",
                  }}
                />
              );
            })}

            {/* Data Polygon */}
            {dataPoints.map((point, i) => {
              const nextPoint = dataPoints[(i + 1) % dataPoints.length];
              const length = Math.sqrt(
                Math.pow(nextPoint.x - point.x, 2) +
                  Math.pow(nextPoint.y - point.y, 2)
              );
              const angle = Math.atan2(
                nextPoint.y - point.y,
                nextPoint.x - point.x
              );

              return (
                <View
                  key={`data-line-${i}`}
                  style={{
                    position: "absolute",
                    left: point.x,
                    top: point.y,
                    width: length,
                    height: 2,
                    backgroundColor: "#EA580C",
                    transform: [{ rotate: `${angle}rad` }],
                    transformOrigin: "left center",
                  }}
                />
              );
            })}

            {/* Data Points */}
            {dataPoints.map((point, i) => (
              <View
                key={`point-${i}`}
                style={{
                  position: "absolute",
                  left: point.x - 4,
                  top: point.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#EA580C",
                }}
              />
            ))}

            {/* Labels */}
            {labels.map((label, i) => (
              <View
                key={`label-${i}`}
                style={{
                  position: "absolute",
                  left: label.x - 30,
                  top: label.y - 10,
                  width: 60,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#D1D5DB",
                    fontSize: 11,
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {label.text.length > 8
                    ? label.text.substring(0, 8) + "."
                    : label.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Categories Stats */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1.5,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            TOP CATEGORIES
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {categoryData
              .filter((item) => item.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 3)
              .map((item, index) => (
                <View
                  key={`stat-${index}`}
                  style={{
                    backgroundColor: "rgba(234, 88, 12, 0.1)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "rgba(234, 88, 12, 0.3)",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#EA580C",
                      fontSize: 18,
                      fontWeight: "900",
                    }}
                  >
                    {item.count}
                  </Text>
                  <Text
                    style={{
                      color: "#D1D5DB",
                      fontSize: 10,
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {item.category}
                  </Text>
                </View>
              ))}
          </View>
        </View>


      </View>
    </View>
  );
};
