1. In the docs, when you make providers I believe there is a typo, which makes sigh out broken.

```ts
return (
  <AuthContext.Provider
    value={{
      session,
      isLoading,
      profile,
      // Before: isLoggedIn: session !== null
      // After
      isLoggedIn: session !== null && session !== undefined,
    }}
  >
    {children}
  </AuthContext.Provider>
);
```