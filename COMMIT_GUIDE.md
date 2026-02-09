# Commit Guide

Use clear, consistent commit messages that describe *what* changed and *why*.

## Format
```
Type: Short summary (50 chars max)

Details:
- Why this change was needed
- Key implementation notes
- Tests run (if any)
```

## Common Types
- `Feature`: New functionality
- `Fix`: Bug fix
- `Refactor`: Internal cleanup without behavior changes
- `Style`: CSS or UI changes
- `Docs`: Documentation updates
- `Chore`: Tooling or housekeeping

## Examples
```
Fix: Align event logos on mobile

Details:
- Reserve logo space to prevent layout shift
- Add fallbacks for missing team images
- Tested on iPhone 375px
```

## Tips
- Keep commits small and focused.
- Always mention tests you ran.
- Prefer imperative verbs: "Add", "Fix", "Update".
