"use client";

import InputBase from "@/module-base/client/components/Input";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { KeyRound, Lock } from "lucide-react";
import { useState } from "react";

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
        className="flex-1"
        color="danger"
        size="sm"
        startContent={<KeyRound size={16} />}
        variant="flat"
        onPress={() => setIsOpen(true)}
      >
        Change Password
      </Button>

      <Modal
        isOpen={isOpen}
        placement="center"
        size="md"
        onClose={() => setIsOpen(false)}
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
                    placeholder="Enter current password"
                    startContent={<Lock className="text-gray-400" size={16} />}
                    type="password"
                    variant="bordered"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">New Password</label>
                  <InputBase
                    placeholder="Enter new password"
                    startContent={<Lock className="text-gray-400" size={16} />}
                    type="password"
                    variant="bordered"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <InputBase
                    placeholder="Confirm new password"
                    startContent={<Lock className="text-gray-400" size={16} />}
                    type="password"
                    variant="bordered"
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
