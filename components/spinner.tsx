import React, { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";
import type { ViewProps } from "react-native";

const AnimatedView = Animated.createAnimatedComponent((props: ViewProps) => (
  <Animated.View {...props} />
));

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dots" | "pulse" | "bars" | "orbital";
  className?: string;
}

const Spinner = ({
  size = "md",
  variant = "dots",
  className = "",
}: SpinnerProps) => {
  const animValue1 = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;
  const animValue3 = useRef(new Animated.Value(0)).current;

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-6 h-6", dot: "w-1.5 h-1.5", bar: "w-1 h-4" },
    md: { container: "w-8 h-8", dot: "w-2 h-2", bar: "w-1 h-6" },
    lg: { container: "w-12 h-12", dot: "w-3 h-3", bar: "w-1.5 h-8" },
    xl: { container: "w-16 h-16", dot: "w-4 h-4", bar: "w-2 h-10" },
  };

  useEffect(() => {
    if (variant === "dots" || variant === "bars") {
      // Staggered animation for dots/bars
      const createStaggeredAnimation = (value: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: 1,
              duration: 600,
              delay,
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 600,
              easing: Easing.bezier(0.4, 0.0, 0.2, 1),
              useNativeDriver: true,
            }),
          ])
        );

      createStaggeredAnimation(animValue1, 0).start();
      createStaggeredAnimation(animValue2, 200).start();
      createStaggeredAnimation(animValue3, 400).start();
    } else if (variant === "pulse") {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue1, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(animValue1, {
            toValue: 0,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (variant === "orbital") {
      // Orbital rotation
      Animated.loop(
        Animated.timing(animValue1, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        })
      ).start();
    }

    return () => {
      animValue1.stopAnimation();
      animValue2.stopAnimation();
      animValue3.stopAnimation();
    };
  }, [variant, animValue1, animValue2, animValue3]);

  const renderDots = () => {
    const opacity1 = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
    const opacity2 = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });
    const opacity3 = animValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <AnimatedView
        className={`${sizeConfig[size].container} flex-row items-center justify-center space-x-1`}
      >
        <AnimatedView
          className={`${sizeConfig[size].dot} bg-accent rounded-full`}
          style={{ opacity: opacity1 }}
        />
        <AnimatedView
          className={`${sizeConfig[size].dot} bg-accent rounded-full`}
          style={{ opacity: opacity2 }}
        />
        <AnimatedView
          className={`${sizeConfig[size].dot} bg-accent rounded-full`}
          style={{ opacity: opacity3 }}
        />
      </AnimatedView>
    );
  };

  const renderBars = () => {
    const scaleY1 = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });
    const scaleY2 = animValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });
    const scaleY3 = animValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    });

    return (
      <AnimatedView
        className={`${sizeConfig[size].container} flex-row items-end justify-center space-x-1`}
      >
        <AnimatedView
          className={`${sizeConfig[size].bar} accent rounded-sm`}
          style={{ transform: [{ scaleY: scaleY1 }] }}
        />
        <AnimatedView
          className={`${sizeConfig[size].bar} accent rounded-sm`}
          style={{ transform: [{ scaleY: scaleY2 }] }}
        />
        <AnimatedView
          className={`${sizeConfig[size].bar} accent rounded-sm`}
          style={{ transform: [{ scaleY: scaleY3 }] }}
        />
      </AnimatedView>
    );
  };

  const renderPulse = () => {
    const scale = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1.2],
    });
    const opacity = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.3],
    });

    return (
      <AnimatedView
        className={`${sizeConfig[size].container} items-center justify-center`}
      >
        <AnimatedView
          className={`${sizeConfig[size].container} accent rounded-full`}
          style={{
            transform: [{ scale }],
            opacity,
          }}
        />
      </AnimatedView>
    );
  };

  const renderOrbital = () => {
    const rotate = animValue1.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    return (
      <AnimatedView
        className={`${sizeConfig[size].container} items-center justify-center`}
      >
        <AnimatedView
          className="relative w-full h-full"
          style={{ transform: [{ rotate }] }}
        >
          <AnimatedView className="absolute top-0 left-1/2 w-2 h-2 accent rounded-full -translate-x-1/2" />
          <AnimatedView className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-iconGreenrounded-full -translate-x-1/2" />
          <AnimatedView className="absolute left-0 top-1/2 w-2 h-2 bg-lightPrimaryAccent rounded-full -translate-y-1/2" />
          <AnimatedView className="absolute right-0 top-1/2 w-2 h-2 bg-lightPrimaryAccent rounded-full -translate-y-1/2" />
        </AnimatedView>
      </AnimatedView>
    );
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "bars":
        return renderBars();
      case "pulse":
        return renderPulse();
      case "orbital":
        return renderOrbital();
      default:
        return renderDots();
    }
  };

  return (
    <AnimatedView className={`${className}`}>{renderSpinner()}</AnimatedView>
  );
};

export default Spinner;
