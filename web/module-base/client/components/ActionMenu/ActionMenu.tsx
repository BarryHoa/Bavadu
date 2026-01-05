import { Ellipsis } from "lucide-react";

import { cn } from "@base/client";
import {
  IBaseButton,
  IBaseDropdown,
  IBaseDropdownItem,
  IBaseDropdownMenu,
  IBaseDropdownTrigger,
  IBaseLink,
} from "@base/client/components";

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
  as?: string;
  target?: string;
  variant?: ButtonVariant;
};

export type ActionItem = ActionItemButton | ActionItemLink;

export interface ActionMenuProps {
  actions: ActionItem[];
  className?: string;
}

const isLink = (action: ActionItem): action is ActionItemLink =>
  "href" in action;

const ActionMenu: React.FC<ActionMenuProps> = ({ actions, className }) => {
  const inlineActions = actions.filter((a) => a.placement === "inline");
  const menuActions = actions.filter(
    (a) => a.placement === "menu" || !a.placement
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {inlineActions.map((action) => {
        if (isLink(action)) {
          return (
            <IBaseButton
              key={action.key}
              as={IBaseLink}
              disabled={action.disabled}
              href={action.href}
              rel={action.as}
              size="sm"
              startContent={action.startContent}
              target={action.target}
              variant={action.variant ?? "bordered"}
            >
              {action.label}
            </IBaseButton>
          );
        }

        return (
          <IBaseButton
            key={action.key}
            disabled={action.disabled}
            size="sm"
            startContent={action.startContent}
            variant={action.variant ?? "solid"}
            onPress={action.onPress}
          >
            {action.label}
          </IBaseButton>
        );
      })}

      {menuActions.length > 0 && (
        <IBaseDropdown>
          <IBaseDropdownTrigger>
            <IBaseButton
              isIconOnly
              className="min-w-unit-8 h-6"
              radius="full"
              variant="faded"
            >
              <Ellipsis className="size-4" />
            </IBaseButton>
          </IBaseDropdownTrigger>
          <IBaseDropdownMenu aria-label="Actions" items={menuActions}>
            {(action) => (
              <IBaseDropdownItem
                key={action.key}
                isDisabled={action.disabled}
                startContent={action.startContent}
                textValue={action.label}
                onPress={isLink(action) ? undefined : action.onPress}
                {...(isLink(action)
                  ? {
                      href: action.href,
                      target: action.target,
                      rel: action.as,
                    }
                  : {})}
              >
                {isLink(action) ? (
                  <IBaseLink
                    href={action.href}
                    rel={action.as}
                    target={action.target}
                  >
                    {action.label}
                  </IBaseLink>
                ) : (
                  action.label
                )}
              </IBaseDropdownItem>
            )}
          </IBaseDropdownMenu>
        </IBaseDropdown>
      )}
    </div>
  );
};

export default ActionMenu;
