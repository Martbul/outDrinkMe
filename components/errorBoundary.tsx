import React from "react";
import { View, Text } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.log("Error caught:", error, errorInfo); 
    // You can also log to a crash reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#666",
              marginBottom: 20,
            }}
          >
            The app encountered an error. Please restart the app.
          </Text>
          {__DEV__ && this.state.error && (
            <Text
              style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                fontFamily: "monospace",
              }}
            >
              {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
