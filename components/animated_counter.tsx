import React, { useEffect, useRef } from 'react';
import { TextInput, TextInputProps, InteractionManager } from 'react-native';

interface HighPerfCounterProps extends TextInputProps {
  toValue: number;
  duration?: number;
}

export const HighPerfCounter = ({
  toValue,
  duration = 1000,
  style,
  ...props
}: HighPerfCounterProps) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    let animationFrameId: number;
    let startTimestamp: number | null = null;

    const interactionPromise = InteractionManager.runAfterInteractions(() => {
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = timestamp - startTimestamp;
        
        const rawPercent = Math.min(progress / duration, 1);
        const easePercent = 1 - Math.pow(1 - rawPercent, 1);
        
        const currentValue = Math.floor(toValue * easePercent);

        if (inputRef.current) {
          inputRef.current.setNativeProps({ text: currentValue.toString() });
        }

        if (rawPercent < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
           // Ensure we land on the final number
           if (inputRef.current) {
             inputRef.current.setNativeProps({ text: toValue.toString() });
           }
        }
      };

      animationFrameId = requestAnimationFrame(step);
    });

    return () => {
      interactionPromise.cancel();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [toValue, duration]);

  return (
    <TextInput
      ref={inputRef}
      editable={false}
      defaultValue="0"
      style={[style, { padding: 0, margin: 0, backgroundColor: 'transparent' }]}
      {...props}
    />
  );
};