"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Badge } from "@heroui/badge";
import { Divider } from "@heroui/divider";

export default function ThemeDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          HeroUI Light Theme Demo
        </h1>
        <p className="text-default-600">
          Demo các component với light theme configuration tùy chỉnh
        </p>
      </div>

      {/* Color Palette Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Color Palette</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Primary</h3>
              <div className="space-y-1">
                <div className="h-8 bg-primary-500 rounded flex items-center justify-center text-white text-sm">
                  Primary
                </div>
                <div className="h-6 bg-primary-100 rounded" />
                <div className="h-6 bg-primary-200 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Secondary</h3>
              <div className="space-y-1">
                <div className="h-8 bg-secondary-500 rounded flex items-center justify-center text-white text-sm">
                  Secondary
                </div>
                <div className="h-6 bg-secondary-100 rounded" />
                <div className="h-6 bg-secondary-200 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Success</h3>
              <div className="space-y-1">
                <div className="h-8 bg-success-500 rounded flex items-center justify-center text-white text-sm">
                  Success
                </div>
                <div className="h-6 bg-success-100 rounded" />
                <div className="h-6 bg-success-200 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Warning</h3>
              <div className="space-y-1">
                <div className="h-8 bg-warning-500 rounded flex items-center justify-center text-white text-sm">
                  Warning
                </div>
                <div className="h-6 bg-warning-100 rounded" />
                <div className="h-6 bg-warning-200 rounded" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Buttons Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Buttons</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Button color="primary">Primary</Button>
            <Button color="secondary">Secondary</Button>
            <Button color="success">Success</Button>
            <Button color="warning">Warning</Button>
            <Button color="danger">Danger</Button>
            <Button color="primary" variant="bordered">
              Bordered
            </Button>
            <Button color="primary" variant="light">
              Light
            </Button>
            <Button color="primary" variant="flat">
              Flat
            </Button>
            <Button color="primary" variant="faded">
              Faded
            </Button>
            <Button color="primary" variant="shadow">
              Shadow
            </Button>
            <Button color="primary" variant="ghost">
              Ghost
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Chips Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Chips</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Chip color="primary">Primary</Chip>
            <Chip color="secondary">Secondary</Chip>
            <Chip color="success">Success</Chip>
            <Chip color="warning">Warning</Chip>
            <Chip color="danger">Danger</Chip>
            <Chip color="primary" variant="bordered">
              Bordered
            </Chip>
            <Chip color="primary" variant="flat">
              Flat
            </Chip>
            <Chip color="primary" variant="dot">
              Dot
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* Progress Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Progress</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="space-y-2">
            <Progress color="primary" value={60} />
            <Progress color="secondary" value={40} />
            <Progress color="success" value={80} />
            <Progress color="warning" value={30} />
            <Progress color="danger" value={90} />
          </div>
        </CardBody>
      </Card>

      {/* Badges Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Badges</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            <Badge color="primary" content="5">
              <Button>Primary Badge</Button>
            </Badge>
            <Badge color="secondary" content="3">
              <Button>Secondary Badge</Button>
            </Badge>
            <Badge color="success" content="New">
              <Button>Success Badge</Button>
            </Badge>
            <Badge color="warning" content="!">
              <Button>Warning Badge</Button>
            </Badge>
            <Badge color="danger" content="X">
              <Button>Danger Badge</Button>
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Layout Demo */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold">Layout & Spacing</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-content1">
              <CardBody>
                <h3 className="font-semibold mb-2">Content 1</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content1 color
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content2">
              <CardBody>
                <h3 className="font-semibold mb-2">Content 2</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content2 color
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content3">
              <CardBody>
                <h3 className="font-semibold mb-2">Content 3</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content3 color
                </p>
              </CardBody>
            </Card>
          </div>

          <Divider />

          <div className="text-center">
            <p className="text-default-600">
              Theme configuration đã được áp dụng thành công! Tất cả các
              component đều sử dụng light theme với màu sắc tùy chỉnh.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
