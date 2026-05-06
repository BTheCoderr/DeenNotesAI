import { Redirect } from "expo-router";

/** Middle tab — mirror web FAB: open modal sheet instead of a full screen. */

export default function NewTabRedirect() {
  return <Redirect href="/new-sheet" />;
}
