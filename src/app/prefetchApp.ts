let started = false;

// Fetches the app's code in the background as soon as it opens, so the first
// click into a board doesn't wait on a large download (the board screen is the
// biggest part of the app). It runs once, and only after the page has had a
// moment to draw.
export function prefetchApp(): void {
  if (started) return;
  started = true;
  const none = () => undefined;
  setTimeout(() => {
    void import("../features/space/components/SpaceLayout").catch(none);
    void import("../features/space/components/SpacesPage").catch(none);
    void import("../features/board/components/BoardPage").catch(none);
    // The parts used on demand (the date and field inputs, a card with HTML, a
    // callout or a code block) come a little later, so they don't compete with
    // the screens above, but are there before they're used. The card editor
    // isn't here: useBoard loads it, for people who can edit.
    setTimeout(() => {
      void import("../features/editor/components/MarkdownRich").catch(none);
      void import("../features/board/components/pickers/DatesPicker").catch(
        none,
      );
      void import("../features/board/components/fields/FieldControl").catch(
        none,
      );
    }, 1500);
  }, 150);
}
