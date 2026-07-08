## Summary

Add reusable skeleton loading UI components for improved user experience during data fetching operations in the CloudPage dashboard section.

## Issue ticket number and link

Closes #(no existing issue - feature enhancement)

## Changes

- **Created `src/features/ss-app/components/ui/Skeleton.tsx`**: New reusable skeleton component with:
  - TypeScript prop typing for customizable CSS classes
  - Tailwind CSS `animate-pulse` effect for loading animation
  - Light purple background (`rgba(122,82,255,0.12)`) matching the app's design
  - Flexible sizing via className prop (e.g., `h-12 w-12`, `h-8 w-96`)

- **Updated `src/features/ss-app/pages/dashboard/CloudPage.tsx`**:
  - Added `GoogleDriveSkeleton()` component: Displays skeleton UI while detecting Google Drive folders
    - Shows icon placeholder, title, description, and button skeletons
  - Added `CloudCardSkeleton()` component: Displays skeleton UI for cloud provider cards (Dropbox, OneDrive, iCloud)
  - Implemented conditional rendering based on `isDetectingDrive` loading state
  - Uses actual loading state instead of artificial timeouts (better OSS practice)
  - Maintains existing functionality while improving UX during API calls

## Testing

- [x] Tested locally: Verified skeleton loaders appear when "Detect Drive folders" button is clicked
- [x] Verified skeleton components render correctly with various Tailwind sizes
- [x] Confirmed loading state properly shows/hides based on `isDetectingDrive` flag
- [x] Tested that skeletons disappear after Google Drive detection completes
- [x] No console errors or TypeScript warnings

## Checklist before requesting a review

- [x] Code follows the project's TypeScript style conventions
  - Used TypeScript `type` for component props
  - Proper `React.FC` patterns and hooks usage
  - Consistent with existing codebase style
- [x] No secrets or `.env` values are committed
  - No API keys, tokens, or sensitive data in code
  - Only uses existing environment configuration
- [x] I have performed a self-review of my code
  - Code is readable and maintainable
  - Components are properly typed
  - Follows React best practices
- [x] CI passes
  - No TypeScript errors
  - No ESLint warnings
  - Builds successfully with `npm run build`

## Related Files

- `src/features/ss-app/components/ui/Skeleton.tsx` (NEW)
- `src/features/ss-app/pages/dashboard/CloudPage.tsx` (MODIFIED)
- Skeleton components are ready for reuse in other dashboard pages (LocalStoragePage, TelegramPage, JobHistoryPage)
