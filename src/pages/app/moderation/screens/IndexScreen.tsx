import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { ApiError } from "@/lib/api/client";
import {
  type ReviewDecision,
  usePendingChanges,
  useReviewChange,
} from "@/lib/api/moderation";
import { DiffPanel } from "@/pages/app/moderation/components/diff-panel/DiffPanel";
import { ProposalListItem } from "@/pages/app/moderation/components/proposal-list-item/ProposalListItem";
import { ProposalNote } from "@/pages/app/moderation/components/proposal-note/ProposalNote";
import { SwipeReviewCard } from "@/pages/app/moderation/components/swipe-review-card/SwipeReviewCard";
import { useReviewMode } from "@/pages/app/moderation/hooks/useReviewMode";
import { buildProposalDiff } from "@/pages/app/moderation/proposal-diff";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Centered } from "@/shared/ui/centered/Centered";
import { Icon } from "@/shared/ui/icon/Icon";
import { Segment } from "@/shared/ui/segment/Segment";
import { Text } from "@/shared/ui/text/Text";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type IndexScreenProps = Record<string, never>;

export const IndexScreen = () => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const { wide } = useBreakpoint();
  const styles = useThemeStyles(createStyles);
  const haptic = useHaptics();

  useDocumentTitle(tr("moderation.title.index"));

  const { proposals, isLoading, isError, error, refetch } = usePendingChanges();
  const review = useReviewChange();
  const { reviewMode } = useReviewMode();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"before" | "after">("after");

  // Derive the selection so it stays valid as the queue shrinks after a decision.
  const selected =
    proposals.find((p) => p.id === selectedId) ?? proposals[0] ?? null;

  // Index of the current selection — drives the mobile prev/next navigation.
  const selectedIndex = Math.max(
    0,
    proposals.findIndex((p) => p.id === selected?.id),
  );

  const goPrev = () => {
    if (selectedIndex > 0) setSelectedId(proposals[selectedIndex - 1].id);
  };

  const goNext = () => {
    if (selectedIndex < proposals.length - 1)
      setSelectedId(proposals[selectedIndex + 1].id);
  };

  const decide = (decision: ReviewDecision) => {
    if (!selected) return;
    review.mutate(
      { artworkId: selected.artworkId, changeId: selected.id, decision },
      {
        onSuccess: () =>
          haptic(decision === "approved" ? "success" : "warning"),
      },
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <Centered style={styles.state}>
          <ActivityIndicator color={colors.primary} />
          <Text size="base" color="textSoft">
            {tr("moderation.loading")}
          </Text>
        </Centered>
      );
    }

    if (isError) {
      return (
        <Centered style={styles.state}>
          <Icon name="RotateCw" size="xxl" color="textMuted" />
          <Text size="base" color="textSoft">
            {error instanceof ApiError
              ? error.message
              : tr("moderation.loadError")}
          </Text>
          <Button
            label={tr("common.retry")}
            variant="primary"
            onPress={() => refetch()}
          />
        </Centered>
      );
    }

    if (proposals.length === 0) {
      return (
        <Centered style={styles.state}>
          <Icon
            name="ShieldCheck"
            size="xxxl"
            color="textMuted"
            strokeWidth={1.6}
          />
          <Text size="base" color="textSoft" style={styles.empty}>
            {tr("moderation.empty")}
          </Text>
        </Centered>
      );
    }

    const diff = selected ? buildProposalDiff(selected) : [];

    const footer = selected?.status === "pending" && (
      <View style={[styles.footer]}>
        {review.isError && (
          <Text size="sm" color="danger">
            {review.error instanceof ApiError
              ? review.error.message
              : tr("moderation.loadError")}
          </Text>
        )}
        <View style={styles.actions}>
          <Button
            label={tr("moderation.reject")}
            variant="ghost"
            style={styles.action}
            onPress={() => decide("rejected")}
            isLoading={
              review.isPending && review.variables?.decision === "rejected"
            }
            accessibilityLabel={tr("a11y.rejectChanges")}
          />
          <Button
            label={tr("moderation.accept")}
            variant="primary"
            style={styles.action}
            iconBefore={{ name: "Check" }}
            onPress={() => decide("approved")}
            isLoading={
              review.isPending && review.variables?.decision === "approved"
            }
            accessibilityLabel={tr("a11y.acceptChanges")}
          />
        </View>
      </View>
    );

    // Desktop: the queue lives in a left sidebar, the diff panels on the right.
    if (wide) {
      return (
        <View style={styles.split}>
          <ScrollView
            style={styles.sidebar}
            contentContainerStyle={styles.sidebarContent}
            showsVerticalScrollIndicator={false}
          >
            {proposals.map((proposal) => (
              <ProposalListItem
                key={proposal.id}
                proposal={proposal}
                isActive={proposal.id === selected?.id}
                onPress={() => setSelectedId(proposal.id)}
              />
            ))}
          </ScrollView>

          <View style={styles.main}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {selected && (
                <>
                  <View style={styles.panels}>
                    <DiffPanel side="before" fields={diff} />
                    <DiffPanel side="after" fields={diff} />
                  </View>
                  <ProposalNote note={selected.note} />
                </>
              )}
            </ScrollView>
            {footer}
          </View>
        </View>
      );
    }

    // Mobile: no queue list — step through proposals with prev/next.
    return (
      <>
        <View style={styles.nav}>
          <Button
            label={tr("moderation.prev")}
            variant="ghost"
            size="sm"
            iconBefore={{ name: "ChevronLeft" }}
            onPress={goPrev}
            disabled={selectedIndex === 0}
            accessibilityLabel={tr("a11y.prevProposal")}
          />
          <Text font="mono" size="sm" color="textSoft">
            {`${selectedIndex + 1} / ${proposals.length}`}
          </Text>
          <Button
            label={tr("moderation.next")}
            variant="ghost"
            size="sm"
            iconAfter={{ name: "ChevronRight" }}
            onPress={goNext}
            disabled={selectedIndex >= proposals.length - 1}
            accessibilityLabel={tr("a11y.nextProposal")}
          />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {selected && (
            <View style={styles.detail}>
              <View style={styles.toggle}>
                <Segment
                  label={tr("moderation.before")}
                  isActive={mode === "before"}
                  onPress={() => setMode("before")}
                  accessibilityLabel={tr("a11y.reviewBefore")}
                />
                <Segment
                  label={tr("moderation.after")}
                  isActive={mode === "after"}
                  onPress={() => setMode("after")}
                  accessibilityLabel={tr("a11y.reviewAfter")}
                />
              </View>
              {selected.status === "pending" && reviewMode === "swipe" ? (
                <>
                  <Text
                    font="mono"
                    size="xs"
                    color="textMuted"
                    style={styles.swipeHint}
                  >
                    {tr("moderation.swipeHint")}
                  </Text>
                  <SwipeReviewCard
                    key={selected.id}
                    onAccept={() => decide("approved")}
                    onReject={() => decide("rejected")}
                    isAcceptPending={
                      review.isPending &&
                      review.variables?.decision === "approved"
                    }
                    isRejectPending={
                      review.isPending &&
                      review.variables?.decision === "rejected"
                    }
                  >
                    <DiffPanel side={mode} fields={diff} />
                  </SwipeReviewCard>
                </>
              ) : (
                <DiffPanel side={mode} fields={diff} />
              )}
              <ProposalNote note={selected.note} />
            </View>
          )}
        </ScrollView>

        {reviewMode === "button" && footer}
      </>
    );
  };

  return <WrapperView style={styles.screen}>{renderBody()}</WrapperView>;
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: {
      paddingHorizontal: SpacingEnum.xl,
      paddingTop: SpacingEnum.xl,
    },
    state: { gap: SpacingEnum.md },
    empty: { textAlign: "center" },
    split: { flex: 1, flexDirection: "row", gap: SpacingEnum.xl },
    sidebar: { width: 320, flexGrow: 0, flexShrink: 0 },
    sidebarContent: { gap: SpacingEnum.sm, paddingBottom: SpacingEnum.xl },
    main: { flex: 1 },
    nav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SpacingEnum.md,
    },
    scroll: { flex: 1 },
    scrollContent: { gap: SpacingEnum.xl, paddingBottom: SpacingEnum.xl },
    detail: { gap: SpacingEnum.md },
    swipeHint: { textAlign: "center" },
    toggle: {
      flexDirection: "row",
      gap: SpacingEnum.xs,
      backgroundColor: c.surface2,
      borderRadius: RadiusEnum.md,
      padding: SpacingEnum.xs,
    },
    panels: { flexDirection: "row", gap: SpacingEnum.md },
    footer: {
      gap: SpacingEnum.sm,
      paddingTop: SpacingEnum.md,
      borderTopWidth: 1.5,
      borderTopColor: c.borderSoft,
      paddingBottom: SpacingEnum.sm,
    },
    actions: { flexDirection: "row", gap: SpacingEnum.md },
    action: { flex: 1 },
  });
