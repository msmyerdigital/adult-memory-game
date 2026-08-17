Compiled successfully in 34.2s
  Running TypeScript  ...Failed to type check.

.next/dev/types/validator.ts:9:12
Type error: Cannot find namespace 'React'.

   7 |
   8 | type AppPageConfig<Route extends AppRoutes = AppRoutes> = {
>  9 |   default: React.ComponentType<{ params: Promise<ParamMap[Route]> } & any> | ((props: { pa...
     |            ^
  10 |   generateStaticParams?: (props: { params: ParamMap[Route] }) => Promise<any[]> | any[]
  11 |   generateMetadata?: (
  12 |     props: { params: Promise<ParamMap[Route]> } & any,
Next.js build worker exited with code: 1 and signal: null
PS C:\Users\Admin\adult-memory-game> 