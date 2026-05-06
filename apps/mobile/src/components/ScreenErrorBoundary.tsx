import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { captureAppIssue } from "../lib/sentry/mobile";
import { emerald, fontSerifHeading, fontSizes, ink, minTouchTarget, muted, radii, spacing, stone } from "../theme";

type Props = {
  scope: string;
  title?: string;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Production-safe fallback for thrown render errors. Reports to Sentry when DSN is configured.
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureAppIssue("render_boundary", error, {
      boundary: this.props.scope,
      componentStackPreview: typeof info.componentStack === "string" ? info.componentStack.slice(0, 800) : undefined,
    });
  }

  private retry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.safe} accessibilityRole="alert">
          <ScrollView contentContainerStyle={styles.inner} accessibilityLabel={`Screen error fallback for ${this.props.scope}`}>
            <Text style={styles.title} maxFontSizeMultiplier={1.3}>
              {this.props.title ?? "Something unfurled too quickly"}
            </Text>
            <Text style={styles.body} maxFontSizeMultiplier={1.35}>
              The screen rested so we did not crash the whole session. Retry after a breath — if it persists, reopen the
              section from the tab bar.
            </Text>
            <Text style={styles.mono}>{this.props.scope}</Text>
            <Pressable style={styles.btn} onPress={this.retry} accessibilityRole="button" accessibilityLabel="Try this screen again">
              <Text style={styles.btnTxt}>Try again</Text>
            </Pressable>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: stone },
  inner: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fontSerifHeading,
    fontSize: fontSizes.xxl,
    fontWeight: "600",
    color: ink,
  },
  body: { fontSize: fontSizes.md, color: muted, lineHeight: 24 },
  mono: { fontSize: fontSizes.xs, color: muted },
  btn: {
    alignSelf: "flex-start",
    marginTop: spacing.md,
    backgroundColor: emerald,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: "center",
  },
  btnTxt: { fontWeight: "800", fontSize: fontSizes.md, color: "#fff" },
});
