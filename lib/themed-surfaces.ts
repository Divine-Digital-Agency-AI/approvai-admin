/** Shared surface classes aligned with approvai-client. */

export const themedDropdownPanel =
  "overflow-hidden rounded-[10px] border border-[var(--border)] bg-surface shadow-[var(--shadow-lg)]";

export const themedDropdownItem =
  "w-full px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-[var(--surface-2)]";

export const themedFieldClass =
  "rounded-[10px] border border-[var(--border)] focus:ring-primary/40 focus:border-primary/40";

export const themedModalBackdrop =
  "fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm animate-fade-in sm:p-6";

export const themedModalPanel =
  "animate-fade-in relative w-full max-w-md overflow-hidden rounded-[14px] border border-[var(--border)] bg-surface shadow-[var(--shadow-lg)]";

export const themedModalHeader =
  "flex h-10 min-h-[40px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4";

export const themedModalFooter =
  "flex shrink-0 items-center justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-3";

export const themedModalCloseButton =
  "rounded-[10px] p-1.5 text-foreground/60 transition-colors hover:bg-[var(--surface-2)] hover:text-primary disabled:opacity-50";

export const adminShellOuter =
  "flex min-h-full flex-col md:min-h-[calc(100vh-3rem)]";

export const adminShellInner =
  "relative flex min-h-full flex-1 flex-col rounded-[20px] bg-[#f7f7f7] dark:bg-[#0d0d0d] md:min-h-[calc(100vh-3rem)]";

export const adminPagePad = "px-5 py-6 sm:px-8 sm:py-8 md:pt-4";

export const adminCard =
  "rounded-[20px] bg-white p-4 dark:bg-[#1a1a1a] sm:p-5";

export const adminCardBorder =
  "rounded-[20px] border border-[#d4d4d4] bg-white p-4 dark:border-[#333333] dark:bg-[#1a1a1a] sm:p-5";

export const adminTableWrap =
  "overflow-x-auto rounded-[20px] border border-[#d4d4d4] bg-white dark:border-[#333333] dark:bg-[#1a1a1a]";

export const adminSectionLabel =
  "text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-[#999999]";

export const adminMuted = "text-sm text-[#666666] dark:text-[#7f7f7f]";

export const adminEmptyState =
  "rounded-[20px] border border-dashed border-[#d4d4d4] px-6 py-16 text-center text-sm text-[#666666] dark:border-[#333333] dark:text-[#7f7f7f]";

export const authOverlayShell =
  "relative w-full max-w-md overflow-hidden rounded-[20px] border border-[#d4d4d4] bg-[#f7f7f7] px-6 py-8 shadow-[var(--shadow-lg)] dark:border-[#333333] dark:bg-[#0d0d0d] sm:px-9 sm:py-10";
