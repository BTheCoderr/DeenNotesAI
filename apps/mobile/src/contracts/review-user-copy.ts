/**
 * User-facing copy for App Review / production builds.
 * Do not surface env var names, SDK errors, or internal config labels.
 */

export const COPY_ACCOUNT_SYNC_UNAVAILABLE =
  "Account sync is temporarily unavailable in this build.";

export const COPY_REFLECTION_SAVING_UNAVAILABLE =
  "Reflection saving is temporarily unavailable in this build.";

export const COPY_SUBSCRIPTIONS_UNAVAILABLE =
  "Subscriptions are temporarily unavailable in this build.";

export const COPY_SUBSCRIPTIONS_CATALOG_RETRY =
  "We couldn't load subscription options right now. Check your connection and tap Try again.";

export const COPY_PURCHASE_INCOMPLETE =
  "Purchase did not finish. Try again when you have a steady connection.";

export const COPY_RESTORE_INCOMPLETE =
  "We couldn't restore purchases right now. Try again in a moment.";

/** Optional App Store Review Notes clause (subscriptions / sync resilience). Paste after background-audio paragraph. */
export const APP_STORE_REVIEW_NOTE_CLOUD_AND_IAP =
  "If signed-in reflection sync or in-app subscriptions are temporarily unavailable in a particular build, the app shows concise, consumer-friendly explanations and does not expose internal configuration identifiers. Quran, prayer, and local devotional flows remain available without those capabilities.";

/** Account deletion failure — never expose server or SDK strings in Alert bodies. */
export const COPY_ACCOUNT_DELETE_UNAVAILABLE =
  "Account deletion is temporarily unavailable. Please try again later.";
