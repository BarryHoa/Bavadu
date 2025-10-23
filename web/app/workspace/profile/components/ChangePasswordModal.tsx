"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import InputBase from "@base/components/base/Input";
import { Lock, KeyRound } from "lucide-react";

export default function ChangePasswordModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdatePassword = () => {
    // Logic to update password
    console.log("Updating password...");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        color="danger"
        variant="flat"
        className="flex-1"
        startContent={<KeyRound size={16} />}
        onPress={() => setIsOpen(true)}
        size="sm"
      >
        Change Password
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="md"
        placement="center"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <Lock size={20} />
                Change Password
              </ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Current Password
                  </label>
                  <InputBase
                    type="password"
                    placeholder="Enter current password"
                    variant="bordered"
                    startContent={<Lock size={16} className="text-gray-400" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">New Password</label>
                  <InputBase
                    type="password"
                    placeholder="Enter new password"
                    variant="bordered"
                    startContent={<Lock size={16} className="text-gray-400" />}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <InputBase
                    type="password"
                    placeholder="Confirm new password"
                    variant="bordered"
                    startContent={<Lock size={16} className="text-gray-400" />}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Password requirements:</strong> At least 8
                    characters, including uppercase, lowercase, number and
                    special character.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleUpdatePassword}>
                  Update Password
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
