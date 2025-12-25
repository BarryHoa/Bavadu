import {
  IBaseBadge,
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseCardHeader,
  IBaseChip,
  IBaseDivider,
  IBaseProgress,
} from "@base/client/components";
("use client");

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
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">Color Palette</h2>
        </IBaseCardHeader>
        <IBaseCardBody className="space-y-4">
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
        </IBaseCardBody>
      </IBaseCard>

      {/* Buttons Demo */}
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">Buttons</h2>
        </IBaseCardHeader>
        <IBaseCardBody>
          <div className="flex flex-wrap gap-4">
            <IBaseButton color="primary">Primary</IBaseButton>
            <IBaseButton color="secondary">Secondary</IBaseButton>
            <IBaseButton color="success">Success</IBaseButton>
            <IBaseButton color="warning">Warning</IBaseButton>
            <IBaseButton color="danger">Danger</IBaseButton>
            <IBaseButton color="primary" variant="bordered">
              Bordered
            </IBaseButton>
            <IBaseButton color="primary" variant="light">
              Light
            </IBaseButton>
            <IBaseButton color="primary" variant="flat">
              Flat
            </IBaseButton>
            <IBaseButton color="primary" variant="faded">
              Faded
            </IBaseButton>
            <IBaseButton color="primary" variant="shadow">
              Shadow
            </IBaseButton>
            <IBaseButton color="primary" variant="ghost">
              Ghost
            </IBaseButton>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* Chips Demo */}
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">Chips</h2>
        </IBaseCardHeader>
        <IBaseCardBody>
          <div className="flex flex-wrap gap-4">
            <IBaseChip color="primary">Primary</IBaseChip>
            <IBaseChip color="secondary">Secondary</IBaseChip>
            <IBaseChip color="success">Success</IBaseChip>
            <IBaseChip color="warning">Warning</IBaseChip>
            <IBaseChip color="danger">Danger</IBaseChip>
            <IBaseChip color="primary" variant="bordered">
              Bordered
            </IBaseChip>
            <IBaseChip color="primary" variant="flat">
              Flat
            </IBaseChip>
            <IBaseChip color="primary" variant="dot">
              Dot
            </IBaseChip>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* IBaseProgress Demo */}
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">IBaseProgress</h2>
        </IBaseCardHeader>
        <IBaseCardBody className="space-y-4">
          <div className="space-y-2">
            <IBaseProgress color="primary" value={60} />
            <IBaseProgress color="secondary" value={40} />
            <IBaseProgress color="success" value={80} />
            <IBaseProgress color="warning" value={30} />
            <IBaseProgress color="danger" value={90} />
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* Badges Demo */}
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">Badges</h2>
        </IBaseCardHeader>
        <IBaseCardBody>
          <div className="flex flex-wrap gap-4">
            <IBaseBadge color="primary" content="5">
              <IBaseButton>Primary IBaseBadge</IBaseButton>
            </IBaseBadge>
            <IBaseBadge color="secondary" content="3">
              <IBaseButton>Secondary IBaseBadge</IBaseButton>
            </IBaseBadge>
            <IBaseBadge color="success" content="New">
              <IBaseButton>Success IBaseBadge</IBaseButton>
            </IBaseBadge>
            <IBaseBadge color="warning" content="!">
              <IBaseButton>Warning IBaseBadge</IBaseButton>
            </IBaseBadge>
            <IBaseBadge color="danger" content="X">
              <IBaseButton>Danger IBaseBadge</IBaseButton>
            </IBaseBadge>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {/* Layout Demo */}
      <IBaseCard>
        <IBaseCardHeader>
          <h2 className="text-2xl font-semibold">Layout & Spacing</h2>
        </IBaseCardHeader>
        <IBaseCardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IBaseCard className="bg-content1">
              <IBaseCardBody>
                <h3 className="font-semibold mb-2">Content 1</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content1 color
                </p>
              </IBaseCardBody>
            </IBaseCard>

            <IBaseCard className="bg-content2">
              <IBaseCardBody>
                <h3 className="font-semibold mb-2">Content 2</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content2 color
                </p>
              </IBaseCardBody>
            </IBaseCard>

            <IBaseCard className="bg-content3">
              <IBaseCardBody>
                <h3 className="font-semibold mb-2">Content 3</h3>
                <p className="text-small text-default-600">
                  Background sử dụng content3 color
                </p>
              </IBaseCardBody>
            </IBaseCard>
          </div>

          <IBaseDivider />

          <div className="text-center">
            <p className="text-default-600">
              Theme configuration đã được áp dụng thành công! Tất cả các
              component đều sử dụng light theme với màu sắc tùy chỉnh.
            </p>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
