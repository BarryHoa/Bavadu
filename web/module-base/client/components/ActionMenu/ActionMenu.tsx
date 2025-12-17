import { Button } from "@heroui/button";
import { cn } from "@heroui/react";
import { Ellipsis, Link } from "lucide-react";

import { IBaseDropdown } from "@base/client/components";

type ButtonVariant = "solid" | "flat" | "bordered" | "light";

export type ActionItemBase = {
  key: string;
  label: string;
  startContent?: React.ReactNode;
  disabled?: boolean;
  placement?: "inline" | "menu";
};

export type ActionItemButton = ActionItemBase & {
  onPress: () => void;
  variant?: ButtonVariant;
};

export type ActionItemLink = ActionItemBase & {
  href: string;
  target?: string;
  as?: string;
  variant?: ButtonVariant;
};

export type ActionItem = ActionItemButton | ActionItemLink;

export interface ActionMenuProps {
  actions: ActionItem[];
  className?: string;
  inlineCount?: number;
  menuLabel?: React.ReactNode;
}

const isLink = (action: ActionItem): action is ActionItemLink =>
  "href" in action;

const ActionMenu = ({
  actions,
  className,
  menuLabel = <span>...</span>,
}: ActionMenuProps) => {
  if (!actions || actions.length === 0) return null;
  const inlineActions = actions.filter((a) => a.placement === "inline");
  const menuActions = actions.filter((a) => a.placement !== "inline");

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {inlineActions.map((action) => {
        if (isLink(action)) {
          return (
            <Button
              key={action.key}
              as={Link}
              disabled={action.disabled}
              href={action.href}
              rel={action.as}
              size="sm"
              startContent={action.startContent}
              target={action.target}
              variant={action.variant ?? "bordered"}
            >
              {action.label}
            </Button>
          );
        }

        return (
          <Button
            key={action.key}
            disabled={action.disabled}
            size="sm"
            startContent={action.startContent}
            variant={action.variant ?? "solid"}
            onPress={action.onPress}
          >
            {action.label}
          </Button>
        );
      })}

      {menuActions.length > 0 && (
        <IBaseDropdown
          items={menuActions.map((action) => ({
            key: action.key,
            textValue: action.label,
            ...(isLink(action)
              ? {
                  href: action.href,
                  isReadOnly: action.disabled,
                  rel: action.as,
                  target: action.target,
                }
              : {
                  isDisabled: action.disabled,
                  onPress: action.onPress,
                }),
            children: (
              <div className="flex items-center gap-2">
                {action.startContent}
                <span>{action.label}</span>
              </div>
            ),
          }))}
        >
          <Button
            isIconOnly
            className="min-w-unit-8 h-6"
            radius="full"
            variant="faded"
          >
            <Ellipsis className="size-4" />
          </Button>
        </IBaseDropdown>
      )}
    </div>
  );
};

export default ActionMenu;
