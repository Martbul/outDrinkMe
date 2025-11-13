import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Animated } from "react-native";
import { Accelerometer } from "expo-sensors";

const SHAKE_THRESHOLD = 3; // Sensitivity threshold for shake detection
const NAUSEA_DURATION = 10000; // 10 seconds

interface NauseaContextType {
  isNauseous: boolean;
}

const NauseaContext = createContext<NauseaContextType>({
  isNauseous: false,
});

interface NauseaProviderProps {
  children: ReactNode;
}

export function NauseaProvider({ children }: NauseaProviderProps) {
  const isNauseousRef = useRef(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const chaosAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let subscription: any;
    let lastUpdate = 0;
    let lastX = 0;
    let lastY = 0;
    let lastZ = 0;

    const subscribe = async () => {
      // Set update interval for accelerometer
      Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const currentTime = Date.now();

        if (currentTime - lastUpdate > 100) {
          const diffTime = currentTime - lastUpdate;
          lastUpdate = currentTime;

          // Calculate acceleration difference
          const deltaX = Math.abs(x - lastX);
          const deltaY = Math.abs(y - lastY);
          const deltaZ = Math.abs(z - lastZ);

          const speed = ((deltaX + deltaY + deltaZ) / diffTime) * 10000;

          if (speed > SHAKE_THRESHOLD && !isNauseousRef.current) {
            triggerNauseaEffect();
          }

          lastX = x;
          lastY = y;
          lastZ = z;
        }
      });
    };

    subscribe();

    return () => {
      subscription?.remove();
      // Clean up any running animations
      if (chaosAnimationRef.current) {
        chaosAnimationRef.current.stop();
      }
    };
  }, []);

  const triggerNauseaEffect = () => {
    if (isNauseousRef.current) return; // Don't trigger if already active

    isNauseousRef.current = true;

    // Create chaotic animations
    const createChaosAnimation = () => {
      return Animated.parallel([
        // Rotation chaos
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ),
        // Scale pulsing
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.05,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.95,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ),
        // Horizontal wobble
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateXAnim, {
              toValue: 10,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: -10,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        ),
        // Vertical wobble
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateYAnim, {
              toValue: 8,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: -8,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    const chaosAnimation = createChaosAnimation();
    chaosAnimationRef.current = chaosAnimation;
    chaosAnimation.start();

    // Stop after NAUSEA_DURATION
    setTimeout(() => {
      chaosAnimation.stop();

      // Reset all animations
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isNauseousRef.current = false;
        chaosAnimationRef.current = null;
      });
    }, NAUSEA_DURATION);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <NauseaContext.Provider value={{ isNauseous: isNauseousRef.current }}>
      <Animated.View
        style={{
          flex: 1,
          transform: [
            { rotate },
            { scale: scaleAnim },
            { translateX: translateXAnim },
            { translateY: translateYAnim },
          ],
        }}
      >
        {children}
      </Animated.View>
    </NauseaContext.Provider>
  );
}

export function useNausea() {
  return useContext(NauseaContext);
}
