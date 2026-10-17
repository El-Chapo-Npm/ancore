import { type ReactNode, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

type Props = {
  isRefreshing: boolean;
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
};

const PULL_THRESHOLD_PX = 48;

export const PullToRefreshControl = ({ isRefreshing, onRefresh, children }: Props) => {
  const startYRef = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const isPulling = pullDistance > 0 && !isRefreshing;
  const shouldShowIndicator = isPulling || isRefreshing;

  const handleTouchStart = (event: GestureResponderEvent) => {
    const nativeEvent = event.nativeEvent as any;
    startYRef.current = nativeEvent.pageY ?? null;
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (startYRef.current === null || isRefreshing) {
      return;
    }

    const nativeEvent = event.nativeEvent as any;
    const nextY = nativeEvent.pageY ?? startYRef.current;
    setPullDistance(Math.max(0, Math.min(nextY - startYRef.current, PULL_THRESHOLD_PX)));
  };

  const handleTouchEnd = () => {
    const shouldRefresh = pullDistance >= PULL_THRESHOLD_PX;

    startYRef.current = null;
    setPullDistance(0);

    if (shouldRefresh && !isRefreshing) {
      void onRefresh();
    }
  };

  return (
    <View
      testID="pull-to-refresh"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {shouldShowIndicator ? (
        <Text style={styles.indicator} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {isRefreshing ? 'Refreshing transactions...' : 'Release to refresh'}
        </Text>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    padding: 12,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
  },
});
