"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";

import { useAuthStore } from "@/lib/stores/authStore";
import { useThemeStore } from "@/lib/stores/themeStore";
import { x } from "@xstyled/emotion";
import { css } from "@emotion/react";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getCurrentTheme } = useThemeStore();
  const theme = getCurrentTheme();

  return (
    <x.div
      minHeight="100vh"
      backgroundColor="background"
      color="foreground"
      suppressHydrationWarning
    >
      {/* Header */}
      <x.header
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p="lg"
        borderBottom="1px solid"
        borderColor="border"
      >
        <x.h1 fontSize="3xl" fontWeight="bold" margin="0">
          Bava Frontend
        </x.h1>

        <x.div display="flex" gap="md" alignItems="center">
          {isAuthenticated ? (
            <x.div display="flex" gap="sm" alignItems="center">
              <span>Welcome, {user?.name}!</span>
              <Button type="outline" onClick={logout}>
                Logout
              </Button>
            </x.div>
          ) : (
            <Button>Login</Button>
          )}
        </x.div>
      </x.header>

      {/* Main Content */}
      <x.main p="xl" maxWidth="1200px" margin="0 auto">
        <x.section marginBottom="3rem">
          <x.h2 fontSize="2xl" fontWeight="semibold" margin="0 0 1rem 0">
            UI Components Demo
          </x.h2>
          <x.p fontSize="lg" color="mutedForeground" margin="0 0 2rem 0">
            High-performance React components with Next.js 15, Ark UI, and
            XStyled Emotion CSS
          </x.p>
        </x.section>

        {/* Components Grid */}
        <x.div
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
          gap="lg"
          marginBottom="2rem"
        >
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles and sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <x.div display="flex" flexWrap="wrap" gap="md">
                <Button type="primary">Primary</Button>
                <Button type="secondary">Secondary</Button>
                <Button type="outline">Outline</Button>
                <Button type="ghost">Ghost</Button>
                <Button type="destructive">Destructive</Button>
              </x.div>
              <x.div display="flex" flexWrap="wrap" gap="md" mt="md">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </x.div>
              <x.div display="flex" flexWrap="wrap" gap="md" mt="md">
                <Button loading>Loading</Button>
                <Button leftIcon={<span>✨</span>}>Icon Left</Button>
                <Button rightIcon={<span>🚀</span>}>Icon Right</Button>
              </x.div>
            </CardContent>
          </Card>

          {/* Input Field */}
          <Card>
            <CardHeader>
              <CardTitle>Input Field</CardTitle>
              <CardDescription>
                Text input with label and helper text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <x.div display="flex" flexDirection="column" gap="md">
                <Input placeholder="Enter your email" />
                <Input
                  // label="Password"
                  type="password"
                  placeholder="Enter your password"

                  // helperText="Password must be at least 8 characters."
                />
                <Input
                  // label="Username"
                  placeholder="Enter your username"
                  disabled
                  value="33333"
                  // error="Username is required."
                />
              </x.div>
            </CardContent>
          </Card>

          {/* Theme Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Demo</CardTitle>
              <CardDescription>
                Switch between light, dark, and blue themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <x.div
                p="md"
                backgroundColor="muted"
                borderRadius="md"
                fontSize="sm"
              >
                <x.p marginBottom="sm">Current theme colors:</x.p>
                <x.div display="flex" gap="sm" flexWrap="wrap" marginTop="sm">
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.primary[500]}
                    borderRadius="sm"
                    title="Primary"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.secondary[500]}
                    borderRadius="sm"
                    title="Secondary"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.success[500]}
                    borderRadius="sm"
                    title="Success"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.error[500]}
                    borderRadius="sm"
                    title="Error"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.warning[500]}
                    borderRadius="sm"
                    title="Warning"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.background}
                    borderRadius="sm"
                    title="Background"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    // backgroundColor={theme.colors.foreground}
                    borderRadius="sm"
                    title="Foreground"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    // backgroundColor={theme.colors.muted}
                    borderRadius="sm"
                    title="Muted"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    backgroundColor={theme.colors.border}
                    borderRadius="sm"
                    title="Border"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    // backgroundColor={theme.colors.input}
                    borderRadius="sm"
                    title="Input"
                  />
                  <x.div
                    width="20px"
                    height="20px"
                    // backgroundColor={theme.colors.ring}
                    borderRadius="sm"
                    title="Ring"
                  />
                </x.div>
              </x.div>
            </CardContent>
          </Card>
        </x.div>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Key features of this boilerplate</CardDescription>
          </CardHeader>
          <CardContent>
            <x.div
              display="grid"
              gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
              gap="lg"
            >
              <x.div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  🚀 Performance
                </h3>
                <ul
                  style={{
                    fontSize: "0.875rem",
                    // color: theme.colors.mutedForeground,
                    listStyle: "disc",
                    paddingLeft: "1rem",
                    margin: "0",
                  }}
                >
                  <li>Next.js 15 với App Router</li>
                  <li>XStyled Emotion - Utility-first CSS-in-JS</li>
                  <li>Ark UI - Headless components</li>
                  <li>Zustand - Lightweight state</li>
                </ul>
              </x.div>

              <x.div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  🎨 Developer Experience
                </h3>
                <ul
                  style={{
                    fontSize: "0.875rem",
                    // color: theme.colors.mutedForeground,
                    listStyle: "disc",
                    paddingLeft: "1rem",
                    margin: "0",
                  }}
                >
                  <li>TypeScript - Type safety</li>
                  <li>Hot reload optimization</li>
                  <li>Theme switching</li>
                  <li>Component composition</li>
                </ul>
              </x.div>
            </x.div>
          </CardContent>
        </Card>
      </x.main>
    </x.div>
  );
}
