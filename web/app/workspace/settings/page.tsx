"use client";

import { IBaseInput } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";

import BackgroundSetting from "./features/BackgroundSetting";
import LanguageSetting from "./features/LanguageSetting";
import NumberSetting from "./features/NumberSetting";

export default function WorkspaceSettings() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Language & Number Settings - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LanguageSetting />
          <NumberSetting />
        </div>

        {/* Background Setting - Full width */}
        <BackgroundSetting />
        {/* General Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">General Settings</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <IBaseInput
                defaultValue="My Workspace"
                placeholder="Enter workspace name"
                variant="bordered"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Description</label>
              <IBaseInput
                defaultValue=""
                placeholder="Enter workspace description"
                variant="bordered"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Public Workspace</label>
                <p className="text-xs text-default-500">
                  Allow others to view this workspace
                </p>
              </div>
              <Switch defaultSelected />
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Notifications</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Email Notifications
                </label>
                <p className="text-xs text-default-500">
                  Receive notifications via email
                </p>
              </div>
              <Switch defaultSelected />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Push Notifications
                </label>
                <p className="text-xs text-default-500">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Activity Updates</label>
                <p className="text-xs text-default-500">
                  Notifications for workspace activity
                </p>
              </div>
              <Switch defaultSelected />
            </div>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Security</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">
                  Two-Factor Authentication
                </label>
                <p className="text-xs text-default-500">
                  Add an extra layer of security
                </p>
              </div>
              <Switch />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Session Timeout</label>
                <p className="text-xs text-default-500">
                  Automatically log out after inactivity
                </p>
              </div>
              <Switch defaultSelected />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Session Timeout Duration
              </label>
              <IBaseInput
                defaultValue="30"
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">minutes</span>
                  </div>
                }
                placeholder="30"
                type="number"
                variant="bordered"
                width="200px"
              />
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="bordered">Cancel</Button>
          <Button color="primary">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
