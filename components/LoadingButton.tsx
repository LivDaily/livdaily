/**
 * Loading Button Component Template
 *
 * A button that shows a loading indicator when processing.
 * Commonly used for API calls, form submissions, etc.
 *
 * Features:
 * - Shows loading spinner when loading=true
 * - Disables interaction when loading
 * - Customizable styles
 * - Works with Pressable for better touch feedback
 *
 * Usage:
 * ```tsx
 * <LoadingButton
 *   loading={isSubmitting}
 *   onPress={handleSubmit}
 *   title="Submit"
 * />
 * ```
 */

import React, { useState } from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Modal,
} from "react-native";

interface LoadingButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingColor?: string;
}

export function LoadingButton({
  onPress,
  title,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  loadingColor,
}: LoadingButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={loadingColor || (variant === "outline" ? "#007AFF" : "#fff")}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text` as keyof typeof styles],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// Loading State Component
export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <View style={stateStyles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={stateStyles.loadingText}>{message}</Text>
    </View>
  );
}

// Error State Component
export function ErrorState({ 
  message = "Something went wrong", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void;
}) {
  return (
    <View style={stateStyles.centerContainer}>
      <Text style={stateStyles.errorIcon}>⚠️</Text>
      <Text style={stateStyles.errorText}>{message}</Text>
      {onRetry && (
        <Pressable 
          onPress={onRetry} 
          style={stateStyles.retryButton}
        >
          <Text style={stateStyles.retryButtonText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

// Empty State Component
export function EmptyState({ 
  message = "No content yet", 
  ctaText,
  onCtaPress 
}: { 
  message?: string; 
  ctaText?: string;
  onCtaPress?: () => void;
}) {
  return (
    <View style={stateStyles.centerContainer}>
      <Text style={stateStyles.emptyIcon}>📭</Text>
      <Text style={stateStyles.emptyText}>{message}</Text>
      {ctaText && onCtaPress && (
        <Pressable 
          onPress={onCtaPress} 
          style={stateStyles.ctaButton}
        >
          <Text style={stateStyles.ctaButtonText}>{ctaText}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "#5856D6",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#007AFF",
  },
});

const stateStyles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Custom Alert Modal Component (Web-compatible replacement for Alert.alert)
interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onDismiss?: () => void;
}

export function AlertModal({ visible, title, message, buttons = [], onDismiss }: AlertModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={alertStyles.overlay}>
        <View style={alertStyles.container}>
          <Text style={alertStyles.title}>{title}</Text>
          <Text style={alertStyles.message}>{message}</Text>
          <View style={alertStyles.buttonContainer}>
            {buttons.length === 0 ? (
              <Pressable
                style={alertStyles.button}
                onPress={onDismiss}
              >
                <Text style={alertStyles.buttonText}>OK</Text>
              </Pressable>
            ) : (
              buttons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[
                    alertStyles.button,
                    button.style === 'destructive' && alertStyles.destructiveButton,
                    button.style === 'cancel' && alertStyles.cancelButton,
                  ]}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss?.();
                  }}
                >
                  <Text
                    style={[
                      alertStyles.buttonText,
                      button.style === 'destructive' && alertStyles.destructiveButtonText,
                      button.style === 'cancel' && alertStyles.cancelButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Hook to use AlertModal
export function useAlert() {
  const [alertState, setAlertState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: {
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }[]
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  const AlertComponent = () => (
    <AlertModal
      visible={alertState.visible}
      title={alertState.title}
      message={alertState.message}
      buttons={alertState.buttons}
      onDismiss={hideAlert}
    />
  );

  return { showAlert, AlertComponent };
}

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#000',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});
