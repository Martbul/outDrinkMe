import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { usePostHog, PostHog } from "posthog-react-native"; // 1. Import PostHog types and hook

// 2. Add posthog to the Props interface
interface Props {
  children: ReactNode;
  posthog?: PostHog;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// 3. Keep the logic in the Class Component
class ErrorBoundaryClasses extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("=== ERROR BOUNDARY CAUGHT ===");
    console.error("Error:", error);

    // 4. Use the injected prop to capture the event
    this.props.posthog?.capture("app_error", {
      error_message: error.message,
      error_name: error.name,
      error_stack: error.stack ?? null,
      component_stack: errorInfo.componentStack ?? null,
      timestamp: new Date().toISOString(),
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-black items-center justify-center p-4">
          <Text className="text-white text-2xl font-bold mb-4">
            Something went wrong
          </Text>

          <ScrollView className="w-full max-h-96 bg-gray-900 p-4 rounded-lg mb-4">
            <Text className="text-red-500 text-xs mb-2">
              {this.state.error?.name}: {this.state.error?.message}
            </Text>
            <Text className="text-gray-400 text-xs">
              {this.state.error?.stack}
            </Text>
            {this.state.errorInfo && (
              <Text className="text-gray-500 text-xs mt-2">
                {this.state.errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-orange-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// 5. Create a Functional Wrapper to access the Hook
const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const posthog = usePostHog();

  return (
    <ErrorBoundaryClasses posthog={posthog}>{children}</ErrorBoundaryClasses>
  );
};

// 6. Export the Wrapper
export default ErrorBoundary;
