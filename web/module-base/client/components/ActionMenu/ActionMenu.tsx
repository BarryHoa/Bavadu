import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { cn } from "@heroui/react";
import { Ellipsis, Link } from "lucide-react";

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
              href={action.href}
              target={action.target}
              rel={action.as}
              variant={action.variant ?? "bordered"}
              size="sm"
              startContent={action.startContent}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          );
        }

        return (
          <Button
            key={action.key}
            variant={action.variant ?? "solid"}
            size="sm"
            startContent={action.startContent}
            onPress={action.onPress}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        );
      })}

      {menuActions.length > 0 && (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="faded"
              radius="full"
              className="min-w-unit-8 h-6"
            >
              <Ellipsis className="size-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu>
            {menuActions.map((action) => {
              if (isLink(action)) {
                return (
                  <DropdownItem
                    key={action.key}
                    textValue={action.label}
                    isReadOnly={action.disabled}
                    href={action.href}
                    target={action.target}
                    rel={action.as}
                  >
                    <div className="flex items-center gap-2">
                      {action.startContent}
                      <span>{action.label}</span>
                    </div>
                  </DropdownItem>
                );
              }

              return (
                <DropdownItem
                  key={action.key}
                  textValue={action.label}
                  isDisabled={action.disabled}
                  onPress={action.onPress}
                >
                  <div className="flex items-center gap-2">
                    {action.startContent}
                    <span>{action.label}</span>
                  </div>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      )}
    </div>
  );
};

export default ActionMenu;
