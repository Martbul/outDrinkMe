// import React from "react";
// import { View, Text } from "react-native";

// interface Props {
//   children: React.ReactNode;
// }

// interface State {
//   hasError: boolean;
//   error?: Error;
// }

// class ErrorBoundary extends React.Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error): State {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
//     console.log("Error caught:", error, errorInfo);
//     // You can also log to a crash reporting service here
//     // Example: Sentry.captureException(error, { extra: errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 20,
//             backgroundColor: "#f5f5f5",
//           }}
//         >
//           <Text
//             style={{
//               fontSize: 18,
//               fontWeight: "bold",
//               marginBottom: 10,
//               textAlign: "center",
//             }}
//           >
//             Something went wrong
//           </Text>
//           <Text
//             style={{
//               textAlign: "center",
//               color: "#666",
//               marginBottom: 20,
//             }}
//           >
//             The app encountered an error. Please restart the app.
//           </Text>
//           {__DEV__ && this.state.error && (
//             <Text
//               style={{
//                 fontSize: 12,
//                 color: "#999",
//                 textAlign: "center",
//                 fontFamily: "monospace",
//               }}
//             >
//               {this.state.error.message}
//             </Text>
//           )}
//         </View>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;

import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
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
    // Log detailed error information
    console.error("=== ERROR BOUNDARY CAUGHT ===");
    console.error("Error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Component Stack:", errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // You can also send to an external logging service here
  }

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
            onPress={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
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

export default ErrorBoundary;