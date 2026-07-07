import type { ReactNode } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { SwipeConfirmAction } from "@/pages/app/moderation/components/swipe-confirm-action/SwipeConfirmAction";

export type SwipeReviewCardProps = {
  /** Commit the "approve" decision (fired on confirm-tap). */
  onAccept: () => void;
  /** Commit the "reject" decision (fired on confirm-tap). */
  onReject: () => void;
  /** The approve mutation is in flight. */
  acceptPending?: boolean;
  /** The reject mutation is in flight. */
  rejectPending?: boolean;
  /** The review card content (before/after toggle + diff panel). */
  children: ReactNode;
};

/**
 * Wraps the mobile review card in a swipeable: dragging right reveals a green
 * "accept" panel, dragging left a red "reject" one. The panel opens and stays
 * open — the user taps it to commit (reveal-then-confirm), so a stray swipe never
 * decides on its own. Confirming closes the swipeable; the queue then advances.
 */
export const SwipeReviewCard = ({
  onAccept,
  onReject,
  acceptPending = false,
  rejectPending = false,
  children,
}: SwipeReviewCardProps) => {
  const { t: tr } = useTranslation();
  const ref = useRef<SwipeableMethods>(null);

  const confirm = (decide: () => void) => {
    decide();
    ref.current?.close();
  };

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={48}
      rightThreshold={48}
      renderLeftActions={() => (
        <SwipeConfirmAction
          variant="accept"
          onConfirm={() => confirm(onAccept)}
          loading={acceptPending}
          accessibilityLabel={tr("a11y.acceptChanges")}
        />
      )}
      renderRightActions={() => (
        <SwipeConfirmAction
          variant="reject"
          onConfirm={() => confirm(onReject)}
          loading={rejectPending}
          accessibilityLabel={tr("a11y.rejectChanges")}
        />
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
};
