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

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      suppressHydrationWarning
    >
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-3xl font-bold m-0">Bava Frontend</h1>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span>Welcome, {user?.name}!</span>
              <Button type="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button>Login</Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-[1200px] mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">UI Components Demo</h2>
          <p className="text-lg text-foreground/70 mb-8">
            High-performance React components with Next.js 15 and HeroUI
          </p>
        </section>

        {/* Components Grid */}
        <div
          className="grid gap-6 md:gap-8 mb-8"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
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
              <div className="flex flex-wrap gap-4">
                <Button type="primary">Primary</Button>
                <Button type="secondary">Secondary</Button>
                <Button type="outline">Outline</Button>
                <Button type="default">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <Button loading>Loading</Button>
              </div>
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
              <div className="flex flex-col gap-4">
                <Input placeholder="Enter your email" />
                <Input type="password" placeholder="Enter your password" />
                <Input
                  placeholder="Enter your username"
                  isDisabled
                  value="33333"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Key features of this boilerplate</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              }}
            >
              <div>
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
                    listStyle: "disc",
                    paddingLeft: "1rem",
                    margin: "0",
                  }}
                >
                  <li>Next.js 15 với App Router</li>
                  <li>HeroUI components</li>
                  <li>Zustand - Lightweight state</li>
                </ul>
              </div>

              <div>
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
                    listStyle: "disc",
                    paddingLeft: "1rem",
                    margin: "0",
                  }}
                >
                  <li>TypeScript - Type safety</li>
                  <li>Hot reload optimization</li>
                  <li>Theme-ready</li>
                  <li>Component composition</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
