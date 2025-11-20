// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   ReactNode,
//   useState,
// } from "react";
// import { Animated, StyleSheet, Dimensions } from "react-native";
// import { Accelerometer } from "expo-sensors";

// const SHAKE_THRESHOLD = 3;
// const NAUSEA_DURATION = 10000;
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// interface NauseaContextType {
//   isNauseous: boolean;
// }

// const NauseaContext = createContext<NauseaContextType>({
//   isNauseous: false,
// });

// interface NauseaProviderProps {
//   children: ReactNode;
// }

// export function NauseaProvider({ children }: NauseaProviderProps) {
//   const [isNauseous, setIsNauseous] = useState(false);
//   const waveAnim1 = useRef(new Animated.Value(0)).current;
//   const waveAnim2 = useRef(new Animated.Value(0)).current;
//   const waveAnim3 = useRef(new Animated.Value(0)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;
//   const nauseaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const animationRef = useRef<Animated.CompositeAnimation | null>(null);

//   useEffect(() => {
//     let subscription: any;
//     let lastUpdate = 0;
//     let lastX = 0;
//     let lastY = 0;
//     let lastZ = 0;

//     const subscribe = async () => {
//       Accelerometer.setUpdateInterval(100);

//       subscription = Accelerometer.addListener(({ x, y, z }) => {
//         const currentTime = Date.now();

//         if (currentTime - lastUpdate > 100) {
//           const diffTime = currentTime - lastUpdate;
//           lastUpdate = currentTime;

//           const deltaX = Math.abs(x - lastX);
//           const deltaY = Math.abs(y - lastY);
//           const deltaZ = Math.abs(z - lastZ);

//           const speed = ((deltaX + deltaY + deltaZ) / diffTime) * 10000;

//           if (speed > SHAKE_THRESHOLD && !isNauseous) {
//             triggerNauseaEffect();
//           }

//           lastX = x;
//           lastY = y;
//           lastZ = z;
//         }
//       });
//     };

//     subscribe();

//     return () => {
//       subscription?.remove();
//       if (nauseaTimeoutRef.current) {
//         clearTimeout(nauseaTimeoutRef.current);
//       }
//       if (animationRef.current) {
//         animationRef.current.stop();
//       }
//     };
//   }, [isNauseous]);

//   const triggerNauseaEffect = () => {
//     if (isNauseous) return;

//     setIsNauseous(true);

//     // Fade in overlay
//     Animated.timing(opacityAnim, {
//       toValue: 1,
//       duration: 800,
//       useNativeDriver: true,
//     }).start();

//     // Create wave animations with different frequencies
//     const waveAnimation = Animated.parallel([
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveAnim1, {
//             toValue: 1,
//             duration: 2500,
//             useNativeDriver: true,
//           }),
//           Animated.timing(waveAnim1, {
//             toValue: 0,
//             duration: 2500,
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveAnim2, {
//             toValue: 1,
//             duration: 3200,
//             useNativeDriver: true,
//           }),
//           Animated.timing(waveAnim2, {
//             toValue: 0,
//             duration: 3200,
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(waveAnim3, {
//             toValue: 1,
//             duration: 4000,
//             useNativeDriver: true,
//           }),
//           Animated.timing(waveAnim3, {
//             toValue: 0,
//             duration: 4000,
//             useNativeDriver: true,
//           }),
//         ])
//       ),
//     ]);

//     animationRef.current = waveAnimation;
//     waveAnimation.start();

//     // Stop after duration
//     nauseaTimeoutRef.current = setTimeout(() => {
//       if (animationRef.current) {
//         animationRef.current.stop();
//       }

//       Animated.parallel([
//         Animated.timing(opacityAnim, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(waveAnim1, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(waveAnim2, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(waveAnim3, {
//           toValue: 0,
//           duration: 1000,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         setIsNauseous(false);
//       });
//     }, NAUSEA_DURATION);
//   };

//   // Create multiple wave layers with different patterns
//   const renderWaveLayer = (
//     animValue: Animated.Value,
//     color: string,
//     opacity: number
//   ) => {
//     const translateX = animValue.interpolate({
//       inputRange: [0, 1],
//       outputRange: [0, 30],
//     });

//     const translateY = animValue.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [0, 20, 0],
//     });

//     const scaleX = animValue.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [1, 1.03, 1],
//     });

//     const scaleY = animValue.interpolate({
//       inputRange: [0, 0.5, 1],
//       outputRange: [1, 0.97, 1],
//     });

//     return (
//       <Animated.View
//         style={[
//           StyleSheet.absoluteFill,
//           {
//             backgroundColor: color,
//             opacity: opacity,
//             transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
//           },
//         ]}
//       />
//     );
//   };

//   return (
//     <NauseaContext.Provider value={{ isNauseous }}>
//       <Animated.View style={styles.container}>
//         {children}
//         {isNauseous && (
//           <Animated.View
//             style={[StyleSheet.absoluteFill, { opacity: opacityAnim }]}
//             pointerEvents="none"
//           >
//             {renderWaveLayer(waveAnim1, "rgba(255, 255, 255, 0.15)", 0.5)}
//             {renderWaveLayer(waveAnim2, "rgba(200, 200, 255, 0.1)", 0.4)}
//             {renderWaveLayer(waveAnim3, "rgba(255, 255, 255, 0.1)", 0.3)}
//           </Animated.View>
//         )}
//       </Animated.View>
//     </NauseaContext.Provider>
//   );
// }

// export function useNausea() {
//   return useContext(NauseaContext);
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });
